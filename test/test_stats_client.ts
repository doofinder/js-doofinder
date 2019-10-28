// required for testing
import 'mocha';
import { should, expect } from 'chai';

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

describe('StatsClient', () => {
  beforeEach(() => {
    fetchMock.get('glob:https://eu1-search.doofinder.com/5/stats/init*', {body: {value: true}, status: 200});
    fetchMock.get('https://eu1-search.doofinder.com/5/stats/checkout', {body: {value: true}, status: 200});
    fetchMock.get('https://eu1-search.doofinder.com/5/stats/click', {body: {value: true}, status: 200});
    fetchMock.get('https://eu1-search.doofinder.com/5/stats/banner_click', {body: {value: true}, status: 200});
    fetchMock.get('https://eu1-search.doofinder.com/5/stats/banner_display', {body: {value: true}, status: 200});
    fetchMock.get('glob:https://eu1-search.doofinder.com/5/stats/*',{body: {message: 'Invalid'}, status: 400});
    fetchMock.get('https://eu1-search.doofinder.com/5/stats/notfound',{body: {error: 'search engine not found'}, status: 404});
    fetchMock.get('https://eu1-search.doofinder.com/5/stats/catastrophe', 503);
  });

  afterEach(() => {
    fetchMock.reset();
  });

  context('StatsClient inner workings', () => {
    it('should set the correct hashid when sent with new session', (done) => {
      // given
      let sc = new StatsClient({zone: Zone.EU});

      // when
      sc.requestSession('myInventedSessionId', cfg.hashid);

      // then
      sc.hashid.should.be.equal(cfg.hashid);
      done();
    });
  });

  context('StatsClient requests', () => {
    it('should make a correct init call in requestSession', async () => {
      // given
      let sc = new StatsClient({zone: Zone.EU});

      // when
      const response = await sc.requestSession('anotherSessionID', cfg.hashid);

      // then
      response.status.should.be.equal(200);
    });
  });

});
