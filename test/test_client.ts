// required for testing
import 'mocha';
import { use, should, expect } from 'chai';

import * as chaiAsPromised from 'chai-as-promised';
use(chaiAsPromised);

// TODO: Using chai-as-promised this can be removed
import { expectAsync } from './util/async';

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
      it('should use EU1', done => {
        (new Client()).zone.should.equal('eu1');
        (new Client({ secret: cfg.secret })).zone.should.equal('eu1');
        done();
      });
    });

    context('with key with zone and no zone', () => {
      it('should use zone from key', done => {
        const client = new Client({ secret: `us1-${cfg.secret}` });
        client.zone.should.equal('us1');
        done();
      })

      it('should break if api key is malformed', done => {
        (() => new Client({ secret: '-abcd' })).should.throw();
        done();
      });
    });

    context('with key with zone and zone', () => {
      it("should use key's zone", done => {
        const client = new Client({ secret: cfg.key, zone: 'us1' });
        client.zone.should.equal('eu1');
        done();
      });
    });

    context('HTTP Headers', () => {
      it('should add passed headers to the request', done => {
        const client = new Client({ secret: cfg.key, headers: { 'X-Name': 'John Smith' } });
        client.headers['X-Name'].should.equal('John Smith');
        done()
      });

      it ("won't replace API Keys passed in options", done => {
        const client = new Client({
          secret: cfg.key,
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
      it('should use default address if not defined', done => {
        const client = cfg.getClient();
        client.endpoint.should.equal(cfg.endpoint);
        done();
      });

      it('should use custom address if defined', done => {
        const client = new Client({ secret: cfg.key, serverAddress: 'localhost:4000' });
        client.endpoint.should.equal('https://localhost:4000');
        done();
      });
    });
  });

  context('request() method', () => {
    it('throws error if bad request sent', done => {
      const BAD_REQUEST_URL = `${cfg.endpoint}/5/error`;
      fetchMock.get(BAD_REQUEST_URL, { body: { message: 'Invalid' }, status: 400 });
      cfg.getClient().request(BAD_REQUEST_URL).should.be.rejectedWith(ClientResponseError).notify(done);
    });

    it('throws error if wrong url sent', done => {
      const NOT_FOUND_URL = `${cfg.endpoint}/5/notfound`;
      fetchMock.get(NOT_FOUND_URL,{body: {error: 'search engine not found'}, status: 404});
      cfg.getClient().request(NOT_FOUND_URL).should.be.rejectedWith(ClientResponseError).notify(done);
    });

    it('throws error in case of internal server error', done => {
      const INTERNAL_ERROR_URL = `${cfg.endpoint}/5/catastrophe`;
      fetchMock.get(INTERNAL_ERROR_URL, 503);
      cfg.getClient().request(INTERNAL_ERROR_URL).should.be.rejectedWith(ClientResponseError).notify(done);
    });

    it('handles response success', async () => {
      const SUCCESS_URL = `${cfg.endpoint}/5/success`;
      fetchMock.get(SUCCESS_URL, { body: {}, status: 200 });

      const client = cfg.getClient();
      const response = await client.request(SUCCESS_URL);

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

  // context('topStats()', () => {
  //   const query = {
  //     hashid: cfg.hashid,
  //     days: '7',
  //     withresults: 'true'
  //   }

  //   it('searches', done => {
  //     const url = `${cfg.endpoint}/5/topstats/searches`;
  //     // @ts-ignore
  //     fetchMock.get({ url, query }, { body: {}, status: 200 });
  //     cfg.getClient().topStats('searches', query).should.be.fulfilled.notify(done);
  //   });

  //   it('clicks', done => {
  //     const url = `${cfg.endpoint}/5/topstats/clicks`;
  //     // @ts-ignore
  //     fetchMock.get({ url, query }, { body: {}, status: 200 });
  //     cfg.getClient().topStats('clicks', query).should.be.fulfilled.notify(done);
  //   });
  // });
});
