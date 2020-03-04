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
import { Query, QueryParams } from '../src/query';

// config, utils & mocks
import * as cfg from './config';

// Mock the fetch API
import * as fetchMock from 'fetch-mock';
import { Zone, StatsEvent } from '../src/types';
import { isPlainObject } from '../src/util/is';
import { ValidationError } from '../src/util/validators';

const host: string = 'https://eu1-search.doofinder.com';

// test
describe('Client', () => {
  afterEach(() => {
    fetchMock.reset();
  });

  context('Instantiation', () => {
    context('with invalid API key', () => {
      it('should break', (done) => {
        (() => new Client({ apiKey: 'abcd' })).should.throw();
        done();
      });
    });

    context('with API Key and zone', () => {
      it("should use API key's zone", (done) => {
        const client = new Client({ zone: Zone.US1, apiKey: 'eu1-abcd' });
        client.endpoint.should.equal(cfg.endpoint);
        done();
      });
    });

    context('HTTP Headers', () => {
      it('should add passed headers to the request', (done) => {
        const client = new Client({ apiKey: cfg.apiKey, headers: { 'X-Name': 'John Smith' } });
        client.headers['X-Name'].should.equal('John Smith');
        done()
      });

      it ("won't replace API Keys passed in options", (done) => {
        const client = new Client({
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
        const client = new Client({ apiKey: cfg.apiKey, serverAddress: 'localhost:4000' });
        client.endpoint.should.equal('https://localhost:4000');
        done();
      });
    });
  });

  context('request() method', () => {
    it('throws error if bad request sent', done => {
      const BAD_REQUEST_URL = `${host}/5/error`;
      fetchMock.get(BAD_REQUEST_URL, { body: { message: 'Invalid' }, status: 400 });
      cfg.getClient().request(BAD_REQUEST_URL).should.be.rejectedWith(ClientResponseError).notify(done);
    });

    it('throws error if wrong url sent', done => {
      const NOT_FOUND_URL = `${host}/5/notfound`;
      fetchMock.get(NOT_FOUND_URL,{body: {error: 'search engine not found'}, status: 404});
      cfg.getClient().request(NOT_FOUND_URL).should.be.rejectedWith(ClientResponseError).notify(done);
    });

    it('throws error in case of internal server error', done => {
      const INTERNAL_ERROR_URL = `${host}/5/catastrophe`;
      fetchMock.get(INTERNAL_ERROR_URL, 503);
      cfg.getClient().request(INTERNAL_ERROR_URL).should.be.rejectedWith(ClientResponseError).notify(done);
    });

    it('handles response success', async () => {
      const SUCCESS_URL = `${host}/5/success`;
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

    it('works if called with hashid only', async () => {
      const url = `${host}/5/options/${cfg.hashid}`;
      fetchMock.get(url, {body: {}, status: 200});

      const response = await cfg.getClient().options(cfg.hashid);

      fetchMock.called(url).should.be.true;
      expect(isPlainObject(response)).to.be.true;
    });

    it('works if called with a suffix', async () => {
      const url = `${host}/5/options/${cfg.hashid}?example.com`;
      fetchMock.get(url, {body: {}, status: 200});

      const client = cfg.getClient();
      const response = await client.options(cfg.hashid, 'example.com');

      fetchMock.called(url).should.be.true;
      expect(isPlainObject(response)).to.be.true;
    });
  });

  context('search()', () => {
    const url = `glob:${host}/5/search?*random=*`;

    beforeEach(() => {
      fetchMock.get(url, { body: {}, status: 200 });
    });

    it('throws if passed parameters with no hashid', done => {
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
      const url = `${host}/5/stats/init`;
      const query = {
        hashid: cfg.hashid,
        session_id: 'abc'
      }
      // @ts-ignore
      fetchMock.get({ url, query }, { body: {}, status: 200 });
      cfg.getClient().stats(StatsEvent.Init, { hashid: cfg.hashid, session_id: 'abc'}).should.be.fulfilled.notify(done);
    });
  });
});
