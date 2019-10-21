// required for testing
import * as mocha from 'mocha';
import * as chai from 'chai';


// chai
chai.should();
const expect = chai.expect;

// required for tests
import { Client } from '../src/doofinder';

// config, utils & mocks
import * as cfg from './config';

// Mock the fetch API
import * as fetchMock from 'fetch-mock';
import { Zone, ClientError } from '../src/types';

function buildQuery(query?: string, params?: object) {
  // Quite hackish if you ask me...
  return (cfg.getClient() as any).__buildSearchQueryString(query, params);
}

// test
describe('Client', () => {
  beforeEach(() => {
    fetchMock.get('https://eu1-search.doofinder.com/test', {body: {value: true}, status: 200});
    fetchMock.get('https://eu1-search.doofinder.com/error',{body: {message: 'Invalid'}, status: 400});
    fetchMock.get('https://eu1-search.doofinder.com/notfound',{body: {error: 'search engine not found'}, status: 404});
    fetchMock.get('https://eu1-search.doofinder.com/catastrophe', 503);
    fetchMock.get('glob:https://eu1-search.doofinder.com/*/stats/*', {body: {}, status: 200});
    fetchMock.get('glob:https://eu1-search.doofinder.com/*', {body: {}, status: 200});
  });

  afterEach(() => {
    fetchMock.reset();
  });

  context('Instantiation', () => {
    context('with invalid API key', () => {
      it('should break', (done) => {
        (() => new Client({hashid: cfg.hashid, apiKey: 'abcd'})).should.throw();
        done();
      });
    });

    context('with API Key and zone', () => {
      it("should use API key's zone", (done) => {
        const client = new Client({hashid: cfg.hashid, zone: Zone.US, apiKey: 'eu1-abcd'});
        client.endpoint.should.equal(cfg.endpoint);
        done();
      });
    });

    context('HTTP Headers', () => {
      it('should add passed headers to the request', (done) => {
        const client = new Client({hashid: cfg.hashid, apiKey: cfg.apiKey, headers:
          {'X-Name': 'John Smith'}});
        client.headers['X-Name'].should.equal('John Smith');
        done()
      });

      it ("won't replace API Keys passed in options", (done) => {
        const client = new Client({hashid: cfg.hashid, apiKey: cfg.apiKey, headers: {
          'X-Name': 'John Smith',
          'Authorization': 'abc'
        }});
        client.headers['X-Name'].should.equal('John Smith');
        client.headers['Authorization'].should.equal('aaaaaaaaaabbbbbbbbbbccccccccccdddddddddd');
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

  context('Request', () => {
    it('handles request errors gracefully', async () => {
      let response = await cfg.getClient().request('/error');
      response.statusCode.should.be.equal(400);
      (response as ClientError).error.message.should.be.equal('Bad Request');
      (response as ClientError).data.message.should.be.equal('Invalid');

      response = await cfg.getClient().request('/notfound');
      response.statusCode.should.equal(404);
      (response as ClientError).error.message.should.be.equal('Not Found');
      (response as ClientError).data.error.should.be.equal('search engine not found');

      response = await cfg.getClient().request('/catastrophe');
      response.statusCode.should.equal(503);
    });

    it('handles response success', async () => {
      const response = await cfg.getClient().request('/somewhere');
      response.data.should.be.empty;
      response.statusCode.should.be.equal(200);
    });
  });

  context('Options', () => {
    it('Call with no arguments is done to the correct URL', async () => {
      const response = await cfg.getClient().options();
      expect(fetchMock.called(`${cfg.endpoint}/5/options/${cfg.hashid}`)).to.be.true;
      response.data.should.be.empty;
    });

    it('Call with argument generates the correct url params', async () => {
      const response = await cfg.getClient().options('example.com');
      expect(fetchMock.called(`${cfg.endpoint}/5/options/${cfg.hashid}?example.com`)).to.be.true;
      response.data.should.eql({});
    });
  });

  context('Search', () => {
    context('Basic Parameters', () => {
      it('uses default basic parameters if none set', (done) => {
        const querystring = `hashid=${cfg.hashid}&query=`;
        buildQuery().should.equal(querystring);
        done();
      });

      it('accepts different basic parameters than the default ones', (done) => {
        const querystring = `page=2&rpp=100&hello=world&hashid=${cfg.hashid}&query=`;
        (buildQuery(undefined, {page: 2, rpp: 100, hello: 'world'})).should.equal(querystring);
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
        const params = {
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
      it('accepts a single field name to sort on', (done) => {
        const querystring = `sort=brand&hashid=${cfg.hashid}&query=`;
        (buildQuery(undefined, {sort: 'brand'})).should.equal(querystring);
        done();
      });

      it('accepts an object for a single field to sort on', (done) => {
        const querystring = `sort%5Bbrand%5D=desc&hashid=${cfg.hashid}&query=`;
        const sorting = { brand: 'desc'};
        (buildQuery(undefined, {sort: sorting})).should.equal(querystring);
        done();
      });

      it('fails with an object for a multiple fields to sort on', (done) => {
        const sorting = {
          '_score': 'desc',
          brand: 'asc'
        };
        (() => (buildQuery(undefined, {sort: sorting}))).should.throw();
        done();
      });

      it('accepts an array of objects for a multiple fields to sort on', (done) => {
        const querystring = [
          'sort%5B0%5D%5B_score%5D=desc',
          `&sort%5B1%5D%5Bbrand%5D=asc&hashid=${cfg.hashid}&query=`
        ].join('');
        const sorting = [
          {
            '_score': 'desc'
          },{
            brand: 'asc'
          }
        ];
        (buildQuery(undefined, {sort: sorting})).should.equal(querystring);
        done();
      });
    });
  });

  context('Stats', () => {
    it('Generates the correct url', async () => {
      const client = cfg.getClient();
      let response = await client.stats('test');
      expect(fetchMock.called(`glob:${cfg.endpoint}/5/stats/test?*`)).to.be.true;

      response = await client.stats('test2', {rpp: 20});
      expect(fetchMock.called(`glob:${cfg.endpoint}/5/stats/test2?*rpp=20*`)).to.be.true;
    });
  });
});
