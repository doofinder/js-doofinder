// required for testing
import 'mocha';
import { should, expect } from 'chai';

// chai
should();

import { ClientPool } from '../src/pool';

describe('ClientClientPool', () => {
  it('creates clients with default options', (done) => {
    let client = ClientPool.getClient('eu1-search.doofinder.com');
    client.endpoint.should.equal('//eu1-search.doofinder.com');
    Object.keys(client.headers).length.should.equal(1);
    client.headers.Accept.should.equal('application/json');

    client = ClientPool.getClient('us1-search.doofinder.com');
    client.endpoint.should.equal('//us1-search.doofinder.com');
    done();
  });

  it('freezes pool options', done => {
    ClientPool.options = {
      headers: {
        'X-Whatever': 'value'
      }
    };

    (() => { ClientPool.options.secret = 'blah' }).should.throw;
    (() => { ClientPool.options.headers['Other'] = 'value' }).should.throw;
    (() => { ClientPool.options.headers['X-Whatever'] = 'changed' }).should.throw;

    Object.keys(ClientPool.options).length.should.equal(1);

    done();
  });

  it('creates stats clients that depend on clients', done => {
    let firstClient = ClientPool.getClient('eu1');
    let stats = ClientPool.getStatsClient('eu1');

    stats.client.should.equal(firstClient);
    expect(stats.client.secret).to.be.undefined;

    firstClient.headers.Authorization = 'abc';
    stats.client.headers.Authorization.should.equal(firstClient.headers.Authorization);

    ClientPool.options = {
      headers: {
        'X-Whatever': 'something'
      }
    }

    stats = ClientPool.getStatsClient('eu1');
    stats.client.should.not.equal(firstClient);
    Object.keys(stats.client.headers).should.include('X-Whatever');
    expect(stats.client.secret).to.be.undefined;

    done();
  });
});
