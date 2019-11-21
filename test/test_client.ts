// required for testing
import 'mocha';
import { should, expect } from 'chai';

// TODO: Using chai-as-promised this can be removed
import { expectAsync } from './util/async';

// chai
should();

// required for tests
import { Client, ClientResponseError } from '../src/client';
import { InputExtendedSortValue, SortType, InputSortValue } from '../src/query';

// config, utils & mocks
import * as cfg from './config';

// Mock the fetch API
import * as fetchMock from 'fetch-mock';
import { Zone, DoofinderParameters, StatsEvent } from '../src/types';
import { isPlainObject } from '../src/util/is';

function buildQuery(query?: string, params?: DoofinderParameters) {
  return cfg.getClient().buildSearchQueryString(query, params);
}

// test
describe('Client', () => {
  beforeEach(() => {
    fetchMock.get('https://eu1-search.doofinder.com/test', {body: {value: true}, status: 200});
    fetchMock.get('https://eu1-search.doofinder.com/5/error',{body: {message: 'Invalid'}, status: 400});
    fetchMock.get('https://eu1-search.doofinder.com/5/notfound',{body: {error: 'search engine not found'}, status: 404});
    fetchMock.get('https://eu1-search.doofinder.com/5/catastrophe', 503);
    fetchMock.get('glob:https://eu1-search.doofinder.com/*/stats/*', {body: {}, status: 200});
    fetchMock.get('glob:https://eu1-search.doofinder.com/*', {body: {}, status: 200});
  });

  afterEach(() => {
    fetchMock.reset();
  });

  context('Instantiation', () => {
    context('with invalid API key', () => {
      it('should break', (done) => {
        (() => new Client({ hashid: cfg.hashid, apiKey: 'abcd' })).should.throw();
        done();
      });
    });

    context('with API Key and zone', () => {
      it("should use API key's zone", (done) => {
        const client = new Client({ hashid: cfg.hashid, zone: Zone.US, apiKey: 'eu1-abcd' });
        client.endpoint.should.equal(cfg.endpoint);
        done();
      });
    });

    context('HTTP Headers', () => {
      it('should add passed headers to the request', (done) => {
        const client = new Client({ hashid: cfg.hashid, apiKey: cfg.apiKey, headers: { 'X-Name': 'John Smith' } });
        client.headers['X-Name'].should.equal('John Smith');
        done()
      });

      it ("won't replace API Keys passed in options", (done) => {
        const client = new Client({
          hashid: cfg.hashid,
          apiKey: cfg.apiKey,
          headers: {
          'X-Name': 'John Smith',
          'Authorization': 'abc'
        }});
        client.headers['X-Name'].should.equal('John Smith');
        client.headers.Authorization.should.equal('aaaaaaaaaabbbbbbbbbbccccccccccdddddddddd');
        done();
      });
    });

    context('Custom Address', () => {
      it('should use default address if not defined', (done) => {
        const client = cfg.getClient();
        client.endpoint.should.equal(cfg.endpoint);
        done();
      });

      it('should use custom address if defined', (done) => {
        const client = new Client({hashid: cfg.hashid, apiKey: cfg.apiKey, serverAddress: 'localhost:4000'});
        client.endpoint.should.equal('https://localhost:4000');
        done();
      });
    });
  });

  context('request() method', () => {
    it('throws proper request errors', async () => {
      const client = cfg.getClient();

      await expectAsync(
        () => {
          return client.request(
            client.buildUrl('/error')
          );
        },
        (error: ClientResponseError, _result: unknown) => {
          error.statusCode.should.equal(400);
          error.message.should.equal('Bad Request');
          error.response.should.not.be.null;
        }
      );

      await expectAsync(
        () => {
          return client.request(
            client.buildUrl('/notfound')
          );
        },
        (error: ClientResponseError, _result: unknown) => {
          error.statusCode.should.equal(404);
          error.message.should.equal('Not Found');
          error.response.should.not.be.null;
        }
      );

      await expectAsync(
        () => {
          return client.request(
            client.buildUrl('/catastrophe')
          );
        },
        (error: ClientResponseError, _result: unknown) => {
          error.statusCode.should.equal(503);
          error.response.should.not.be.null;
        }
      );
    });

    it('handles response success', async () => {
      const client = cfg.getClient();
      const url = client.buildUrl('/somewhere');
      const response = await client.request(url);
      fetchMock.called(url).should.be.true;
      response.status.should.equal(200);
    });
  });

  context('options() method', () => {
    it('called with no arguments makes requests to the correct URL', async () => {
      const client = cfg.getClient();
      const response = await client.options();
      const expectedUrl = client.buildUrl(`/options/${cfg.hashid}`);
      fetchMock.called(expectedUrl).should.be.true;
      expect(isPlainObject(response)).to.be.true;
    });

    it('called with an argument generates the correct url params', async () => {
      const suffix = 'example.com';
      const client = cfg.getClient();
      const response = await client.options(suffix);
      const expectedUrl = client.buildUrl(`/options/${cfg.hashid}`, suffix);
      fetchMock.called(expectedUrl).should.be.true;
      expect(isPlainObject(response)).to.be.true;
    });
  });

  context('Search', () => {
    context('Basic Parameters', () => {
      it('uses default basic parameters if none set', (done) => {
        const qs = buildQuery();
        qs.should.include(`hashid=${cfg.hashid}`);
        qs.should.include(`query=`);
        done();
      });

      it('accepts different basic parameters than the default ones', (done) => {
        const qs = buildQuery(undefined, { page: 2, rpp: 100, hello: 'world' });
        qs.should.include(`page=2`);
        qs.should.include(`rpp=100`);
        qs.should.include(`hello=world`);
        qs.should.include(`hashid=${cfg.hashid}`);
        qs.should.include(`query=`);
        done();
      });
    });

    context('Types', () => {
      it('specifies no type if no specific type was set', (done) => {
        const querystring = `hashid=${cfg.hashid}&query=`;
        (buildQuery(undefined)).should.equal(querystring);
        done();
      });

      it('handles one type if set', (done) => {
        const querystring = `type=product&hashid=${cfg.hashid}&query=`;
        (buildQuery(undefined, {type: 'product'})).should.equal(querystring);
        (buildQuery(undefined, {type: ['product']})).should.equal(querystring);
        done();
      });

      it('handles several types if set', (done) => {
        const querystring = [
          `type%5B0%5D=product&type%5B1%5D=recipe`,
          `&hashid=${cfg.hashid}&query=`
        ].join('');
        (buildQuery(undefined, {type: ['product', 'recipe']})).should.equal(querystring);
        done();
      });
    });

    context('Filters', () => {
      // Exclusion filters are the same with a different key so not testing here.

      it('handles terms filters', (done) => {
        const querystring = [
          `filter%5Bbrand%5D=NIKE`,
          `&filter%5Bcategory%5D%5B0%5D=SHOES&filter%5Bcategory%5D%5B1%5D=SHIRTS`,
          `&hashid=${cfg.hashid}&query=`
        ].join('');
        const params: DoofinderParameters = {
          filter: {
            brand: 'NIKE',
            category: ['SHOES', 'SHIRTS']
          }
        };
        (buildQuery(undefined, params)).should.equal(querystring);
        done();
      });

      it('handles range filters', (done) => {
        const querystring = [
          'filter%5Bprice%5D%5Bfrom%5D=0',
          `&filter%5Bprice%5D%5Bto%5D=150&hashid=${cfg.hashid}&query=`
        ].join('');

        const params = {
          filter: {
            price: {
              from: 0,
              to: 150
            }
          }
        };

        (buildQuery(undefined, params)).should.equal(querystring);
        done();
      });
    });

    context('Sorting', () => {
      it('accepts a single field name to sort on',(done) => {
        const querystring = `hashid=${cfg.hashid}&query=&sort%5B0%5D%5Bbrand%5D=asc`;
        buildQuery(undefined, { sort: 'brand' }).should.equal(querystring);
        done();
      });

      it('accepts an object for a single field to sort on', (done) => {
        const querystring = `hashid=${cfg.hashid}&query=&sort%5B0%5D%5Bbrand%5D=desc`;
        const sorting: InputExtendedSortValue[] = [{ brand: SortType.DESC }];
        buildQuery(undefined, { sort: sorting }).should.equal(querystring);
        done();
      });

      it('accepts an array of objects for a multiple fields to sort on', (done) => {
        const querystring = `hashid=${cfg.hashid}&query=&sort%5B0%5D%5B_score%5D=desc&sort%5B1%5D%5Bbrand%5D=asc`;
        const sorting: InputSortValue[] = [{ _score: SortType.DESC }, { brand: SortType.ASC }];
        buildQuery(undefined, { sort: sorting }).should.equal(querystring);
        done();
      });
    });
  });

  context('Stats', () => {
    it('Generates the correct url', async () => {
      const client = cfg.getClient();
      await client.stats(StatsEvent.Init);
      fetchMock.called(`glob:${cfg.endpoint}/5/stats/init?*`).should.be.true;

      await client.stats(StatsEvent.Click, {dfid: 'value'});
      fetchMock.called(`glob:${cfg.endpoint}/5/stats/click?*dfid=value*`).should.be.true;
    });
  });
});
