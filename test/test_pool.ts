// required for testing
import 'mocha';
import { should, expect } from 'chai';

// chai
should();

import { Zone } from '../src/client';
import { ClientPool } from '../src/pool';

describe('ClientClientPool', () => {
  it('creates clients with default options', (done) => {
    let client = ClientPool.getClient(Zone.EU1);
    client.endpoint.should.equal('//eu1-search.doofinder.com');
    Object.keys(client.headers).length.should.equal(1);
    client.headers.Accept.should.equal('application/json');

    client = ClientPool.getClient(Zone.US1);
    client.endpoint.should.equal('//us1-search.doofinder.com');
    done();
  });

  it('freezes pool options', done => {
    ClientPool.options = {
      headers: {
        'X-Whatever': 'value'
      }
    };

    (() => { ClientPool.options.key = 'blah' }).should.throw;
    (() => { ClientPool.options.headers['Other'] = 'value' }).should.throw;
    (() => { ClientPool.options.headers['X-Whatever'] = 'changed' }).should.throw;

    Object.keys(ClientPool.options).length.should.equal(1);

    done();
  });

  it('creates stats clients that depend on clients', done => {
    let firstClient = ClientPool.getClient(Zone.EU1);
    let stats = ClientPool.getStatsClient(Zone.EU1);

    stats.client.should.equal(firstClient);
    expect(stats.client.secret).to.be.undefined;

    firstClient.secret = 'abc';
    stats.client.secret.should.equal(firstClient.secret);

    ClientPool.options = {
      headers: {
        'X-Whatever': 'something'
      }
    }

    stats = ClientPool.getStatsClient(Zone.EU1);
    stats.client.should.not.equal(firstClient);
    Object.keys(stats.client.headers).should.include('X-Whatever');
    expect(stats.client.secret).to.be.undefined;

    done();
  });
});
