// required for testing
import 'mocha';
import { use, should, expect } from 'chai';
import * as chaiAsPromised from 'chai-as-promised';

use(chaiAsPromised);

// chai
should();

// required for tests
import { StatsClient, StatsParams, CartItemStatsParams, ClickStatsParamsWithDfid, RedirectionStatsParams, ImageStatsParams } from '../src/stats';
import { ValidationError } from '../src/util/validators';

// config, utils & mocks
import * as cfg from './config';

// Mock the fetch API
import * as fetchMock from 'fetch-mock';

const stats = new StatsClient(cfg.getClient());

// These tests are passed for now and are worked on when the stats client is reimplemented
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
      fetchMock.put({ url: `${cfg.endpoint}/6/${cfg.hashid}/stats/init`, query }, { body: {}, status: 200 });
      stats.registerSession(query).should.be.fulfilled.notify(done);
    });

    it('should register checkout', done => {
      // @ts-ignore
      fetchMock.put({ url: `${cfg.endpoint}/6/${cfg.hashid}/stats/checkout`, query }, { body: {}, status: 200 });
      stats.registerCheckout(query).should.be.fulfilled.notify(done);
    });
  });

  context('result clicks', () => {
    const url = `${cfg.endpoint}/6/${cfg.hashid}/stats/click`;
    const params = {
      session_id: 'mysessionid',
      hashid: cfg.hashid,
    }

    const id = '42'; // fetch mock expects it as string or will fail even with the same url
    const datatype = 'product';
    const dfid = `${cfg.hashid}@${datatype}@a1d0c6e83f027327d8461063f4ac68a6`;

    it('should properly register clicks given a dfid', done => {
      const query: ClickStatsParamsWithDfid = { ...params, dfid };
      // @ts-ignore
      fetchMock.put({ url, query }, { body: {}, status: 200 });
      stats.registerClick(query).should.be.fulfilled.notify(done);
    });

    it('should fail if a wrong dfid is provided', done => {
      const query: ClickStatsParamsWithDfid = { ...params, dfid: 'hello world' };
      stats.registerClick(query).should.be.rejectedWith(ValidationError).notify(done);
    });

    it('should fail if no dfid is provided', done => {
      // @ts-ignore
      const query: ClickStatsParamsWithDfid = { ...params };
      // @ts-ignore
      stats.registerClick(query).should.be.rejectedWith(ValidationError).notify(done);
    });

    it('should fail if no datatype is provided for the given id', done => {
      const query: ClickStatsParamsWithDfid = { ...params, dfid: id };
      // @ts-ignore
      stats.registerClick(query).should.be.rejectedWith(ValidationError).notify(done);
    });

    it('should allow sending the search query along with the rest of the parameters', done => {
      const query: ClickStatsParamsWithDfid = { ...params, dfid, query: 'hello world' };
      // @ts-ignore
      fetchMock.put({ url, query }, { body: {}, status: 200 });
      stats.registerClick(query).should.be.fulfilled.notify(done);
    });

    it('should allow sending a custom result id along with the rest of the parameters', done => {
      const query: ClickStatsParamsWithDfid = { ...params, dfid, custom_results_id: '21' };
      // @ts-ignore
      fetchMock.put({ url, query }, { body: {}, status: 200 });
      stats.registerClick(query).should.be.fulfilled.notify(done);
    });

    it('should allow sending a user id along with the rest of the parameters', done => {
      const query: ClickStatsParamsWithDfid = { ...params, dfid, user_id: '1' };
      // @ts-ignore
      fetchMock.put({ url, query }, { body: {}, status: 200 });
      stats.registerClick(query).should.be.fulfilled.notify(done);
    });
  });

  context('banners', () => {
    const query: ImageStatsParams = {
      session_id: 'mysessionid',
      hashid: cfg.hashid,
      id: '42',
    }
    const url = `${cfg.endpoint}/6/${cfg.hashid}/stats/image`;

    it('should properly register banner clicks', done => {
      // @ts-ignore
      fetchMock.put({ url, query }, { body: {}, status: 200 });
      stats.registerImageClick(query).should.be.fulfilled.notify(done);
    });

    it('should fail if no id is provided', done => {
      const params = { ...query };
      // @ts-ignore
      delete params.id;
      stats.registerImageClick(params).should.be.rejectedWith(ValidationError).notify(done);
    });
  });

  context('redirections', () => {
    const url = `${cfg.endpoint}/6/${cfg.hashid}/stats/redirect`;
    const query: RedirectionStatsParams = {
      session_id: 'mysessionid',
      hashid: cfg.hashid,
      id: '42'
    };

    it('should properly register redirection executions', done => {
      // @ts-ignore
      fetchMock.put({ url, query }, { body: {}, status: 200 });
      stats.registerRedirection(query).should.be.fulfilled.notify(done);
    });

    it('should allow passing a query parameter', done => {
      const params = { ...query, query: 'hello world' };
      // @ts-ignore
      fetchMock.put({ url, query: params }, { body: {}, status: 200 });
      stats.registerRedirection(params).should.be.fulfilled.notify(done);
    });

    it('should break if not have redirection id', done => {
      const params = { ...query };
      // @ts-ignore
      delete params.id;
      // @ts-ignore
      fetchMock.put({ url, query: params }, { body: {}, status: 200 });
      stats.registerRedirection(params).should.be.rejectedWith(ValidationError).notify(done);
    })
  });

  context('Cart', () => {
    const baseUrl: string = `${cfg.endpoint}/6/${cfg.hashid}/stats`;
    const baseParams: StatsParams = {
      session_id: 'mysessionid',
      hashid: cfg.hashid
    };
    const itemParams: CartItemStatsParams = {
      id: '1',
      amount: '1',
      title: "cart item title",
      price: 66,
      index: 'product',
      ...baseParams
    };
    context('add items to cart', () => {
      it('should properly add an item to cart', done => {
        // @ts-ignore
        fetchMock.put({ url: `${baseUrl}/cart/${baseParams.session_id}`, query: itemParams }, { body: {}, status: 200 });
        stats.addToCart(itemParams).should.be.fulfilled.notify(done);
      });

      it('should fail if no id is provided', done => {
        const params = { ...itemParams };
        // @ts-ignore
        delete params.id;

        stats.addToCart(params).should.be.rejectedWith(ValidationError).notify(done);
      });

      it('should fail if no title is provided', done => {
        const params = { ...itemParams };
        // @ts-ignore
        delete params.title;

        stats.addToCart(params).should.be.rejectedWith(ValidationError).notify(done);
      });

      it('should fail if no price is provided', done => {
        const params = { ...itemParams };
        // @ts-ignore
        delete params.price;

        stats.addToCart(params).should.be.rejectedWith(ValidationError).notify(done);
      });

      it('should fail if no index is provided', done => {
        const params = { ...itemParams };
        // @ts-ignore
        delete params.index;

        stats.addToCart(params).should.be.rejectedWith(ValidationError).notify(done);
      });

      it('should fail if no amount is provided', done => {
        const params = { ...itemParams };
        // @ts-ignore
        delete params.amount;

        stats.addToCart(params).should.be.rejectedWith(ValidationError).notify(done);
      });
    })
    context('remove items from cart', () => {
      it('should properly remove an item from cart', done => {
        // @ts-ignore
        fetchMock.patch({ url: `${baseUrl}/cart/${baseParams.session_id}`, query: itemParams }, { body: {}, status: 200 });
        stats.removeFromCart(itemParams).should.be.fulfilled.notify(done);
      });

      it('should fail if no id is provided', done => {
        const params = { ...itemParams };
        // @ts-ignore
        delete params.id;

        stats.removeFromCart(params).should.be.rejectedWith(ValidationError).notify(done);
      });

      it('should fail if no index is provided', done => {
        const params = { ...itemParams };
        // @ts-ignore
        delete params.index;

        stats.removeFromCart(params).should.be.rejectedWith(ValidationError).notify(done);
      });

      it('should fail if no amount is provided', done => {
        const params = { ...itemParams };
        // @ts-ignore
        delete params.amount;

        stats.removeFromCart(params).should.be.rejectedWith(ValidationError).notify(done);
      });

      it('should properly empty the cart', done => {
        // @ts-ignore
        fetchMock.delete({ url: `${baseUrl}/cart/${baseParams.session_id}`, query: baseParams }, { body: {}, status: 200 });
        stats.clearCart(baseParams).should.be.fulfilled.notify(done);
      });
    })
  });
});
