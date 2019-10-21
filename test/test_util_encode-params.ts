import 'mocha';
import { should, expect } from 'chai';

import { butEncoded } from './util/but-encoded';

// chai
should();

// tests
import { buildQueryString } from '../src/util/encode-params';

describe("buildQueryString function", () => {
  it("only accepts plain objects", done => {
    expect(buildQueryString.bind(null, 1)).to.throw('Not an object');
    done();
  });

  it("properly handles plain params", done => {
    const params = {
      a: 1,
      b: 2,
      c: 3
    }

    const qs = buildQueryString(params).split('&');

    // order is not guaranteed, so…
    qs.should.include('a=1');
    qs.should.include('b=2');
    qs.should.include('c=3');

    done();
  });

  it("properly handles array params", done => {
    const params = {
      param: ['abc', 'def']
    }
    buildQueryString(params).should.equal(butEncoded('param[0]=abc&param[1]=def'));
    done();
  });

  it("properly handles object params", done => {
    const params = {
      param: {a: 'abc', b: 'def'}
    }
    buildQueryString(params).should.equal(butEncoded('param[a]=abc&param[b]=def'));
    done();
  });

  it("properly handles nested object / array params", done => {
    const params = {
      arr: [{a: 1, b: 2}, {c: 3, d: 4}, 'efg', [10, 11, 12]],
      filter: {
        type: ['product', 'recipe'],
        inner: {
          prop1: 'value1',
          prop2: 'value2'
        }
      }
    }

    const qs = buildQueryString(params).split('&');

    qs.length.should.equal(12);
    qs.should.include(butEncoded('arr[0][a]=1'));
    qs.should.include(butEncoded('arr[0][b]=2'));
    qs.should.include(butEncoded('arr[1][c]=3'));
    qs.should.include(butEncoded('arr[1][d]=4'));
    qs.should.include(butEncoded('arr[2]=efg'));
    qs.should.include(butEncoded('arr[3][0]=10'));
    qs.should.include(butEncoded('arr[3][1]=11'));
    qs.should.include(butEncoded('arr[3][2]=12'));
    qs.should.include(butEncoded('filter[type][0]=product'));
    qs.should.include(butEncoded('filter[type][1]=recipe'));
    qs.should.include(butEncoded('filter[inner][prop1]=value1'));
    qs.should.include(butEncoded('filter[inner][prop2]=value2'));

    done();
  });
  // it("");
});
