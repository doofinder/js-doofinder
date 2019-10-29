// required for testing
import 'mocha';
import { use, should, expect } from 'chai';
import * as chaiAsPromised from 'chai-as-promised';

use(chaiAsPromised);

// chai
should();

// required for tests
import { StatsClient } from '../src/stats';

// config, utils & mocks
import * as cfg from './config';

// Mock the fetch API
import * as fetchMock from 'fetch-mock';
import { Zone, DoofinderParameters, StatsEvent } from '../src/types';
import { isPlainObject } from '../src/util/is';

const ENDPOINT = 'https://eu1-search.doofinder.com/5/stats/';
const TEST_DFID = 'ffffffffffffffffffffffffffffffff@product@ffffffffffffffffffffffffffffffff';

describe('StatsClient', () => {
  beforeEach(() => {
    fetchMock.get(`glob:${ENDPOINT}init*`, {body: {value: true}, status: 200});
    fetchMock.get(`glob:${ENDPOINT}checkout*`, {body: {value: true}, status: 200});
    fetchMock.get(`glob:${ENDPOINT}click*`, {body: {value: true}, status: 200});
    fetchMock.get(`glob:${ENDPOINT}banner_click*`, {body: {value: true}, status: 200});
    fetchMock.get(`glob:${ENDPOINT}banner_display*`, {body: {value: true}, status: 200});
    fetchMock.get(`glob:${ENDPOINT}*`,{body: {message: 'Invalid'}, status: 400});
    fetchMock.get(`${ENDPOINT}notfound`,{body: {error: 'search engine not found'}, status: 404});
    fetchMock.get(`${ENDPOINT}catastrophe`, 503);
  });

  afterEach(() => {
    fetchMock.reset();
  });

  context('StatsClient inner workings', () => {
    it('should set the correct hashid when sent with new session', async () => {
      // given
      let sc = new StatsClient({zone: Zone.EU, apiKey: 'eu1-abcd'});

      // when
      const req = await sc.requestSession('myInventedSessionId', cfg.hashid);

      // then
      sc.hashid.should.be.equal(cfg.hashid);
    });
  });

  context('StatsClient session requests', () => {
    it('should make a correct init call in requestSession', async () => {
      // given
      let sc = new StatsClient({zone: Zone.EU, apiKey: 'eu1-abcd'});

      // when
      const response = await sc.requestSession('anotherSessionID', cfg.hashid);

      // then
      fetchMock.lastUrl().should.include('init');
      fetchMock.lastUrl().should.include(`hashid=${cfg.hashid}`);
      fetchMock.lastUrl().should.include('session_id=anotherSessionID');
      response.status.should.be.equal(200);
    });
  });

  context('StatsClient click registration', () => {
    it('should make a correct click call in registerClick with dfid', async () => {
      // given
      let sc = new StatsClient({zone: Zone.EU, apiKey: 'eu1-abcd'});

      // when
      const response = await sc.registerClick('SessionID', TEST_DFID);

      // then
      fetchMock.lastUrl().should.include('click');
      fetchMock.lastUrl().should.include(`dfid=${TEST_DFID}`.replace(/@/g,'%40'));
      fetchMock.lastUrl().should.include('session_id=SessionID');
      response.status.should.be.equal(200);
    });

    it('registerClick should reject incorrect dfid', () => {
      // given
      let sc = new StatsClient({zone: Zone.EU, apiKey: 'eu1-abcd'});

      // when
      return sc.registerClick('SessionID', TEST_DFID).should.eventually.throw;
    });

    it('should make a correct click call in registerClick with id and datatype', async () => {
      // given
      let sc = new StatsClient({zone: Zone.EU, apiKey: 'eu1-abcd'});

      // when
      const response = await sc.registerClick('SessionID', 'SKU10044', 'product');

      // then
      fetchMock.lastUrl().should.include('click');
      fetchMock.lastUrl().should.include('id=SKU10044');
      fetchMock.lastUrl().should.include('session_id=SessionID');
      fetchMock.lastUrl().should.include('datatype=product');
      response.status.should.be.equal(200);
    });

    it('should add query correctly', async () => {
      // given
      let sc = new StatsClient({zone: Zone.EU, apiKey: 'eu1-abcd'});

      // when
      const response = await sc.registerClick('SessionID', 'SKU10044', 'product', 'hammer');

      // then
      fetchMock.lastUrl().should.include('click');
      fetchMock.lastUrl().should.include('id=SKU10044');
      fetchMock.lastUrl().should.include('session_id=SessionID');
      fetchMock.lastUrl().should.include('datatype=product');
      fetchMock.lastUrl().should.include('query=hammer');
      response.status.should.be.equal(200);
    });

    it('should add custom results id correctly', async () => {
      // given
      let sc = new StatsClient({zone: Zone.EU, apiKey: 'eu1-abcd'});

      // when
      const response = await sc.registerClick('SessionID', 'SKU10044', 'product', 'hammer', 140);

      // then
      fetchMock.lastUrl().should.include('click');
      fetchMock.lastUrl().should.include('id=SKU10044');
      fetchMock.lastUrl().should.include('session_id=SessionID');
      fetchMock.lastUrl().should.include('datatype=product');
      fetchMock.lastUrl().should.include('query=hammer');
      fetchMock.lastUrl().should.include('custom_results_id=140');
      response.status.should.be.equal(200);
    });

  });
});
