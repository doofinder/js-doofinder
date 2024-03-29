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
    context('with no server', () => {
      it('should throw', done => {
        (() => new Client()).should.throw(ValidationError);
        done();
      });
    });

    context('with secret key', () => {
      it('should use https', done => {
        const client = new Client({ server: 'eu1-search.doofinder.com', secret: 'any' });
        client.endpoint.should.equal('https://eu1-search.doofinder.com');
        done();
      });
    });

    context('with secret key with server and server', () => {
      it("should use server", done => {
        const client = new Client({ server: 'us1-search.doofinder.com', secret: cfg.key });
        client.server.should.equal('us1-search.doofinder.com');
        done();
      });
    });

    context('with protocol variations', () => {
      it("accepts http protocol", done => {
        const client = new Client({ server: 'http://us1-search.doofinder.com' });
        client.server.should.equal('http://us1-search.doofinder.com');
        client.endpoint.should.equal('http://us1-search.doofinder.com');
        done();
      });

      it("accepts https protocol", done => {
        const client = new Client({ server: 'https://us1-search.doofinder.com' });
        client.server.should.equal('https://us1-search.doofinder.com');
        client.endpoint.should.equal('https://us1-search.doofinder.com');
        done();
      });

      it("accepts protocol-relative url", done => {
        const client = new Client({ server: '//us1-search.doofinder.com' });
        client.server.should.equal('//us1-search.doofinder.com');
        client.endpoint.should.equal('//us1-search.doofinder.com');
        done();
      });
    })

    context('HTTP Headers', () => {
      it('should add passed headers to the request', done => {
        const client = new Client({ server: cfg.server, headers: { 'X-Name': 'John Smith' } });
        client.headers['X-Name'].should.equal('John Smith');
        done()
      });

      it("won't replace API Keys passed in options", done => {
        const client = new Client({
          server: cfg.server,
          secret: cfg.secret,
          headers: {
            'X-Name': 'John Smith',
            'Authorization': 'abc'
          }
        });
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
        const client = new Client({ server: 'localhost:4000' });
        client.endpoint.should.equal('//localhost:4000');
        done();
      });
    });
  });

  context('_buildUrl() method', () => {
    const client = cfg.getClient();
    const hashid = cfg.hashid;

    it('can handle resources that already have a querystring', done => {
      // @ts-ignore
      client._buildUrl('/blah?param=value', 'param2=value2', hashid).should.equal(`https://eu1-search.doofinder.com/6/${hashid}/blah?param=value&param2=value2`);
      done();
    });
    it(`can handle resources that don't already have a querystring`, done => {
      // @ts-ignore
      client._buildUrl('/blah', 'param=value', hashid).should.equal(`https://eu1-search.doofinder.com/6/${hashid}/blah?param=value`);
      done();
    });
    it('can handle resources without passing a querystring at all', done => {
      // @ts-ignore
      client._buildUrl('/blah', '', hashid).should.equal(`https://eu1-search.doofinder.com/6/${hashid}/blah`);
      done();
    });
    it('can handle resources without hashid', done => {
      // @ts-ignore
      client._buildUrl('/blah', '').should.equal(`https://eu1-search.doofinder.com/6/blah`);
      done();
    });
  });

  context('request() method', () => {
    it('throws error if bad request sent', done => {
      const BAD_REQUEST_URL = `glob:${cfg.endpoint}/6/error?*random=*`;
      fetchMock.get(BAD_REQUEST_URL, { body: { message: 'Invalid' }, status: 400 });
      cfg.getClient().request('/error').should.be.rejectedWith(ClientResponseError).notify(done);
    });

    it('throws error if wrong url sent', done => {
      fetchMock.get(`glob:${cfg.endpoint}/6/notfound?*random=*`, {
        body: {
          error: 'search engine not found'
        },
        status: 404
      });
      cfg.getClient().request('/notfound').should.be.rejectedWith(ClientResponseError).notify(done);
    });

    it('handles response success', async () => {
      const SUCCESS_URL = `glob:${cfg.endpoint}/6/success?*random=*`;
      fetchMock.get(SUCCESS_URL, { body: {}, status: 200 });

      const client = cfg.getClient();
      const response = await client.request('/success');

      fetchMock.called(SUCCESS_URL).should.be.true;
      response.status.should.equal(200);
    });
  });

  context('search()', () => {
    const hashid = cfg.hashid;
    const url = `glob:${cfg.endpoint}/6/${hashid}/_search?*random=*`;

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
      cfg.getClient().search({ hashid }).should.be.fulfilled.notify(done);
    });
    it('works if passed valid Query instance', done => {
      cfg.getClient().search(new Query({ hashid })).should.be.fulfilled.notify(done);
    });
  });

  context('stats()', () => {
    it('works with sent params', done => {
      const hashid = cfg.hashid;
      const url = `${cfg.endpoint}/6/${hashid}/stats/init`;
      const query = {
        hashid,
        session_id: 'abc'
      }
      // @ts-ignore
      fetchMock.put({ url, query }, { body: {}, status: 200 });
      cfg.getClient().stats('init', { hashid, session_id: 'abc' }).should.be.fulfilled.notify(done);
    });
  });
});
