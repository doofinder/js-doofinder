// required for testing
import 'mocha';
import { should, expect } from 'chai';

// chai
should();

import { pool } from '../src/pool';
import { Zone } from '../src/types';

describe('ClientPool', () => {
  it('creates clients with default options', (done) => {
    let client = pool.getClient(Zone.EU1);
    client.endpoint.should.equal('//eu1-search.doofinder.com');
    Object.keys(client.headers).length.should.equal(1);
    client.headers.Accept.should.equal('application/json');

    client = pool.getClient(Zone.US1);
    client.endpoint.should.equal('//us1-search.doofinder.com');
    done();
  });

  it('freezes pool options', done => {
    pool.options = {
      headers: {
        'X-Whatever': 'value'
      }
    };

    (() => { pool.options.key = 'blah' }).should.throw;
    (() => { pool.options.headers['Other'] = 'value' }).should.throw;
    (() => { pool.options.headers['X-Whatever'] = 'changed' }).should.throw;

    Object.keys(pool.options).length.should.equal(1);

    done();
  });
});
