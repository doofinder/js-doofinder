// required for testing
import 'mocha';
import { use, should, expect } from 'chai';
import * as chaiAsPromised from 'chai-as-promised';

use(chaiAsPromised);

// chai
should();

// required for tests
import { StatsClient, StatsParams, CartItemStatsParams } from '../src/stats';
import { ValidationError } from '../src/util/validators';

// config, utils & mocks
import * as cfg from './config';

// Mock the fetch API
import * as fetchMock from 'fetch-mock';

const stats = new StatsClient(cfg.getClient());

describe('StatsClient', () => {
  afterEach(() => {
    fetchMock.reset();
  });

  context('session / checkout', () => {
    const query = {
      hashid: cfg.hashid,
      session_id: 'mysessionid'
    };

    it('should init session', done => {
      // @ts-ignore
      fetchMock.get({ url: `${cfg.endpoint}/5/stats/init`, query }, { body: {}, status: 200 });
      stats.registerSession(query).should.be.fulfilled.notify(done);
    });

    it('should register checkout', done => {
      // @ts-ignore
      fetchMock.get({ url: `${cfg.endpoint}/5/stats/checkout`, query }, { body: {}, status: 200 });
      stats.registerCheckout(query).should.be.fulfilled.notify(done);
    });
  });

  context('result clicks', () => {
    const url = `${cfg.endpoint}/5/stats/click`;
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
      // @ts-ignore
      stats.registerClick(query).should.be.rejectedWith(ValidationError).notify(done);
    });

    it('should fail if no datatype is provided for the given id', done => {
      const query = { ...params, id };
      // @ts-ignore
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
    const query = {
      session_id: 'mysessionid',
      hashid: cfg.hashid,
      img_id: '42',
    }

    it('should properly register banner clicks', done => {
      const url = `${cfg.endpoint}/5/stats/img_click`;
      // @ts-ignore
      fetchMock.get({ url, query }, { body: {}, status: 200 });
      stats.registerImageClick(query).should.be.fulfilled.notify(done);
    });
  });

  context('redirections', () => {
    const url = `${cfg.endpoint}/5/stats/redirect`;
    const query = {
      session_id: 'mysessionid',
      hashid: cfg.hashid,
      redirection_id: '42',
      link: 'https://www.google.com',
    };

    it('should properly register redirection executions', done => {
      // @ts-ignore
      fetchMock.get({ url, query }, { body: {}, status: 200 });
      stats.registerRedirection(query).should.be.fulfilled.notify(done);
    });

    it('should allow passing a query parameter', done => {
      const params = { ...query, query: 'hello world' };
      // @ts-ignore
      fetchMock.get({ url, query: params }, { body: {}, status: 200 });
      stats.registerRedirection(params).should.be.fulfilled.notify(done);
    });

    it('should break if no redirection id nor link are passed', done => {
      const params = { ...query };
      delete params.redirection_id;
      delete params.link;
      // @ts-ignore
      fetchMock.get({ url, query: params }, { body: {}, status: 200 });
      stats.registerRedirection(params).should.be.rejectedWith(ValidationError).notify(done);
    })
  });

  context('cart api', () => {
    const baseUrl: string = `${cfg.endpoint}/5/stats`;
    const baseParams: StatsParams = {
      session_id: 'mysessionid',
      hashid: cfg.hashid
    };
    const itemParams: CartItemStatsParams = {
      id: '1',
      amount: 1,
      index: 'test_index',
      title: "cart item title",
      price: 55,
      ...baseParams
    };

    it('should properly add an item to cart', done => {
      // @ts-ignore
      fetchMock.get({ url: `${baseUrl}/add-to-cart`, query: itemParams }, { body: {}, status: 200 });
      stats.addToCart(itemParams).should.be.fulfilled.notify(done);
    });

    it('should properly remove an item from cart', done => {
      // @ts-ignore
      fetchMock.get({ url: `${baseUrl}/remove-from-cart`, query: itemParams }, { body: {}, status: 200 });
      stats.removeFromCart(itemParams).should.be.fulfilled.notify(done);
    });

    it('should properly empty the cart', done => {
      // @ts-ignore
      fetchMock.get({ url: `${baseUrl}/clear-cart`, query: baseParams }, { body: {}, status: 200 });
      stats.clearCart(baseParams).should.be.fulfilled.notify(done);
    });
  });
});
