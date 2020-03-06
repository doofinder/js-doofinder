// required for testing
import 'mocha';
import { use, should, expect } from 'chai';
import * as chaiAsPromised from 'chai-as-promised';

use(chaiAsPromised);

// chai
should();

// required for tests
import { Client } from '../src/client';
import { StatsClient } from '../src/stats';

// config, utils & mocks
import * as cfg from './config';

// Mock the fetch API
import * as fetchMock from 'fetch-mock';
import { Zone, StatsEvent } from '../src/types';
import { pool } from '../src/pool';
import { ValidationError } from '../src/util/validators';

describe('StatsClient', () => {
  beforeEach(() => {
    pool.reset();
    // required to get https in requests and mocks to work
    pool.getClient(Zone.EU1).secret = '0123456789abcdef';
    pool.getClient(Zone.US1).secret = '0123456789abcdef';
  });

  afterEach(() => {
    pool.reset();
    fetchMock.reset();
  });

  context('client', () => {
    it('is not affected by search client changes', done => {
      pool.reset();

      const stats = new StatsClient(Zone.EU1);
      const client = stats.client;

      Object.keys(stats.client.headers).length.should.equal(1);

      pool.options = {
        headers: {
          'X-Whatever': 'some value'
        }
      }

      stats.client.should.not.equal(client);
      Object.keys(stats.client.headers).length.should.equal(2);
      stats.client.headers['X-Whatever'].should.equal('some value');
      done();
    });
  });

  context('session / checkout', () => {
    const stats = new StatsClient(Zone.EU1);
    const query = {
      hashid: cfg.hashid,
      session_id: 'mysessionid'
    };

    it('should init session', done => {
      // @ts-ignore
      fetchMock.get({ url: `${cfg.endpoint}/5/stats/${StatsEvent.Init}`, query }, { body: {}, status: 200 });
      stats.registerSession(query).should.be.fulfilled.notify(done);
    });

    it('should register checkout', done => {
      // @ts-ignore
      fetchMock.get({ url: `${cfg.endpoint}/5/stats/${StatsEvent.Checkout}`, query }, { body: {}, status: 200 });
      stats.registerCheckout(query).should.be.fulfilled.notify(done);
    });
  });

  context('result clicks', () => {
    const stats = new StatsClient(Zone.EU1);

    const url = `${cfg.endpoint}/5/stats/${StatsEvent.Click}`;
    const params = {
      session_id: 'mysessionid',
      hashid: cfg.hashid,
    }

    const id = '42'; // fetch mock expects it as string or will fail even with the same url
    const datatype = 'product';
    const dfid = `${cfg.hashid}@${datatype}@a1d0c6e83f027327d8461063f4ac58a6`;

    it('should properly register clicks given a dfid', done => {
      const query = { ...params, dfid };
      // @ts-ignore
      fetchMock.get({ url, query }, { body: {}, status: 200 });
      stats.registerClick(query).should.be.fulfilled.notify(done);
    });

    it('should properly register clicks given an id and a datatype', done => {
      const query = { ...params, id, datatype };
      // @ts-ignore
      fetchMock.get({ url, query }, { body: {}, status: 200 });
      stats.registerClick(query).should.be.fulfilled.notify(done);
    });

    it('should fail if a wrong dfid is provided', done => {
      const query = { ...params, dfid: 'hello world' };
      stats.registerClick(query).should.be.rejectedWith(ValidationError).notify(done);
    });

    it('should fail if no id is provided for the given datatype', done => {
      const query = { ...params, datatype };
      stats.registerClick(query).should.be.rejectedWith(ValidationError).notify(done);
    });

    it('should fail if no datatype is provided for the given id', done => {
      const query = { ...params, id };
      stats.registerClick(query).should.be.rejectedWith(ValidationError).notify(done);
    });

    it('should allow sending the search query along with the rest of the parameters', done => {
      const query = { ...params, dfid, query: 'hello world' };
      // @ts-ignore
      fetchMock.get({ url, query }, { body: {}, status: 200 });
      stats.registerClick(query).should.be.fulfilled.notify(done);
    });

    it('should allow sending a custom result id along with the rest of the parameters', done => {
      const query = { ...params, dfid, custom_results_id: '21' };
      // @ts-ignore
      fetchMock.get({ url, query }, { body: {}, status: 200 });
      stats.registerClick(query).should.be.fulfilled.notify(done);
    });
  });

  context('banners', () => {
    const stats = new StatsClient(Zone.EU1);
    const query = {
      session_id: 'mysessionid',
      hashid: cfg.hashid,
      banner_id: '33',
    }

    it('should properly register banner impressions', done => {
      const url = `${cfg.endpoint}/5/stats/${StatsEvent.BannerDisplay}`;
      // @ts-ignore
      fetchMock.get({ url, query }, { body: {}, status: 200 });
      stats.registerBannerDisplayEvent(query).should.be.fulfilled.notify(done);
    });

    it('should properly register banner clicks', done => {
      const url = `${cfg.endpoint}/5/stats/${StatsEvent.BannerClick}`;
      // @ts-ignore
      fetchMock.get({ url, query }, { body: {}, status: 200 });
      stats.registerBannerClickEvent(query).should.be.fulfilled.notify(done);
    });
  });
});
