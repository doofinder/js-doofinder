// required for testing
import 'mocha';
import { should, expect } from 'chai';

// chai
should();

import { ClientPool } from '../src/pool';
import { Zone } from '../src/types';

describe('ClientPool', () => {
  context('Creation', () => {
    context('without options', () => {
      it('should create clients with default options', (done) => {
        const pool = new ClientPool();
        const client = pool.getClient(Zone.EU1);

        client.endpoint.should.equal('//eu1-search.doofinder.com');
        Object.keys(client.headers).length.should.equal(1);
        client.headers.Accept.should.equal('application/json');

        done();
      })
    })

    context('with options', () => {
      it('should accept only serverAddress and headers options', (done) => {
        const pool = new ClientPool({
          apiKey: 'blah',
          headers: {
            'X-Whatever': 'value'
          },
          serverAddress: 'localhost:8080'
        });
        const client = pool.getClient(Zone.EU1);

        client.endpoint.should.equal('//localhost:8080');
        expect(client.secret).to.be.undefined;
        Object.keys(client.headers).length.should.equal(2);
        client.headers['Accept'].should.equal('application/json');
        client.headers['X-Whatever'].should.equal('value');

        done();
      })
    })
  })

  context('Options', () => {
    it('freezes pool options', (done) => {
      const pool = new ClientPool();
      pool.options = {
        headers: {
          'X-Whatever': 'value'
        }
      };

      (() => { pool.options.apiKey = 'blah' }).should.throw;
      (() => { pool.options.headers['Other'] = 'value' }).should.throw;
      (() => { pool.options.headers['X-Whatever'] = 'changed' }).should.throw;

      Object.keys(pool.options).length.should.equal(1);

      done();
    })
  })
});
