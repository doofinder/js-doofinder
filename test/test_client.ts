// required for testing
import 'mocha';
import { use, should, expect } from 'chai';

import * as chaiAsPromised from 'chai-as-promised';
use(chaiAsPromised);

// chai
should();

// required for tests
import { Client, ClientResponseError } from '../src/client';
import { ClientPool } from '../src/pool';
import { Query } from '../src/query';
import { ValidationError } from '../src/util/validators';

// config, utils & mocks
import * as cfg from './config';

// Mock the fetch API
import * as fetchMock from 'fetch-mock';

// test
describe('Client', () => {
  afterEach(() => {
    ClientPool.reset();
    fetchMock.reset();
  });

  context('Instantiation', () => {
    context('with no zone', () => {
      it('should throw', done => {
        (() => new Client()).should.throw(ValidationError);
        done();
      });
    });

    context('with secret key', () => {
      it('should use https', done => {
        const client = new Client({ zone: 'eu1', secret: 'any' });
        client.endpoint.should.equal('https://eu1-search.doofinder.com');
        done();
      });
    });

    context('with secret key with zone and zone', () => {
      it("should use zone", done => {
        const client = new Client({ zone: 'us1', secret: cfg.key });
        client.zone.should.equal('us1');
        done();
      });
    });

    context('HTTP Headers', () => {
      it('should add passed headers to the request', done => {
        const client = new Client({ zone: cfg.zone, headers: { 'X-Name': 'John Smith' } });
        client.headers['X-Name'].should.equal('John Smith');
        done()
      });

      it ("won't replace API Keys passed in options", done => {
        const client = new Client({
          zone: cfg.zone,
          secret: cfg.secret,
          headers: {
          'X-Name': 'John Smith',
          'Authorization': 'abc'
        }});
        client.headers['X-Name'].should.equal('John Smith');
        client.headers.Authorization.should.equal('Token aaaaaaaaaabbbbbbbbbbccccccccccdddddddddd');
        done();
      });
    });

    context('Custom Address', () => {
      it('should use default address if not defined', done => {
        const client = cfg.getClient();
        client.endpoint.should.equal(cfg.endpoint);
        done();
      });

      it('should use custom address if defined', done => {
        const client = new Client({ zone: cfg.zone, serverAddress: 'localhost:4000' });
        client.endpoint.should.equal('//localhost:4000');
        done();
      });
    });
  });

  context('_buildUrl() method', () => {
    const client = cfg.getClient();

    it('can handle resources that already have a querystring', done => {
      // @ts-ignore
      client._buildUrl('/blah?param=value', 'param2=value2').should.equal('https://eu1-search.doofinder.com/5/blah?param=value&param2=value2');
      done();
    });
    it(`can handle resources that don't already have a querystring`, done => {
      // @ts-ignore
      client._buildUrl('/blah', 'param=value').should.equal('https://eu1-search.doofinder.com/5/blah?param=value');
      done();
    });
    it('can handle resources without passing a querystring at all', done => {
      // @ts-ignore
      client._buildUrl('/blah').should.equal('https://eu1-search.doofinder.com/5/blah');
      done();
    });
  });

  context('request() method', () => {
    it('throws error if bad request sent', done => {
      const BAD_REQUEST_URL = `glob:${cfg.endpoint}/5/error?*random=*`;
      fetchMock.get(BAD_REQUEST_URL, { body: { message: 'Invalid' }, status: 400 });
      cfg.getClient().request('/error').should.be.rejectedWith(ClientResponseError).notify(done);
    });

    it('throws error if wrong url sent', done => {
      fetchMock.get(`glob:${cfg.endpoint}/5/notfound?*random=*`, {
        body: {
          error: 'search engine not found'
        },
        status: 404
      });
      cfg.getClient().request('/notfound').should.be.rejectedWith(ClientResponseError).notify(done);
    });

    it('throws error in case of internal server error', done => {
      fetchMock.get(`glob:${cfg.endpoint}/5/catastrophe?*random=*`, 503);
      cfg.getClient().request('/catastrophe').should.be.rejectedWith(ClientResponseError).notify(done);
    });

    it('handles response success', async () => {
      const SUCCESS_URL = `glob:${cfg.endpoint}/5/success?*random=*`;
      fetchMock.get(SUCCESS_URL, { body: {}, status: 200 });

      const client = cfg.getClient();
      const response = await client.request('/success');

      fetchMock.called(SUCCESS_URL).should.be.true;
      response.status.should.equal(200);
    });
  });

  context('options() method', () => {
    it('throws if called with no hashid', done => {
      // @ts-ignore
      cfg.getClient().options().should.be.rejectedWith(ValidationError).notify(done);
    });

    it('throws if called with wrong hashid', done => {
      cfg.getClient().options('meh').should.be.rejectedWith(ValidationError).notify(done);
    });

    it('works if called with valid hashid', done => {
      const url = `${cfg.endpoint}/5/options/${cfg.hashid}`;
      // @ts-ignore
      fetchMock.get({url, query: {}}, {body: {}, status: 200});
      cfg.getClient().options(cfg.hashid).should.be.fulfilled.notify(done);
    });
  });

  context('search()', () => {
    const url = `glob:${cfg.endpoint}/5/search?*random=*`;

    beforeEach(() => {
      fetchMock.get(url, { body: {}, status: 200 });
    });

    it('throws if passed parameters with no hashid', done => {
      // @ts-ignore
      cfg.getClient().search({}).should.be.rejectedWith(ValidationError).notify(done);
    });
    it('throws if passed Query instance with no hashid', done => {
      cfg.getClient().search(new Query()).should.be.rejectedWith(ValidationError).notify(done);
    });
    it('works if passed valid parameters', done => {
      cfg.getClient().search({ hashid: cfg.hashid }).should.be.fulfilled.notify(done);
    });
    it('works if passed valid Query instance', done => {
      cfg.getClient().search(new Query({ hashid: cfg.hashid })).should.be.fulfilled.notify(done);
    });
  });

  context('stats()', () => {
    it('works with sent params', done => {
      const url = `${cfg.endpoint}/5/stats/init`;
      const query = {
        hashid: cfg.hashid,
        session_id: 'abc'
      }
      // @ts-ignore
      fetchMock.get({ url, query }, { body: {}, status: 200 });
      cfg.getClient().stats('init', { hashid: cfg.hashid, session_id: 'abc'}).should.be.fulfilled.notify(done);
    });
  });

  context('topStats()', () => {
    const query = {
      hashid: cfg.hashid,
      days: '7',
      withresults: 'true'
    }

    it('searches', done => {
      const url = `${cfg.endpoint}/5/topstats/searches`;
      // @ts-ignore
      fetchMock.get({ url, query }, { body: {}, status: 200 });
      cfg.getClient().topStats('searches', query).should.be.fulfilled.notify(done);
    });

    it('clicks', done => {
      const url = `${cfg.endpoint}/5/topstats/clicks`;
      // @ts-ignore
      fetchMock.get({ url, query }, { body: {}, status: 200 });
      cfg.getClient().topStats('clicks', query).should.be.fulfilled.notify(done);
    });
  });
});
