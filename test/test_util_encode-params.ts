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

    const qs = buildQueryString(params);

    // order is not guaranteed for object keys, so…
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
    const qs = buildQueryString(params);
    qs.should.include(butEncoded('param[a]=abc'));
    qs.should.include(butEncoded('param[b]=def'));
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

    const qs = buildQueryString(params);

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

  it("handles strange characters correctly on param values", done => {
    const params = {
      filter: {
        test: 'ñaka',
        garçon: 'test,value,french',
        quality: 'check-in',
        parenthesis: 'this(null)[0]',
        percentage: '100%'
      }
    };

    const qs = buildQueryString(params);

    qs.should.include('filter%5Btest%5D=%C3%B1aka');
    qs.should.include('filter%5Bgar%C3%A7on%5D=test%2Cvalue%2Cfrench');
    qs.should.include('filter%5Bquality%5D=check-in');
    qs.should.include('filter%5Bparenthesis%5D=this(null)%5B0%5D');
    qs.should.include('filter%5Bpercentage%5D=100%');

    done();
  });

  it("errs on non-object parameters", done => {
    const params = "myvalue";

    //@ts-ignore
    (() => buildQueryString(params)).should.throw();

    done();
  });

  it("errs on array parameters", done => {
    const params = ["myvalue", "anothervalue"];

    //@ts-ignore
    (() => buildQueryString(params)).should.throw();

    done();
  });

  it('does not dump undefined values but respects falsy values, in a non-destructive way', done => {
    const params: Record<string, any> = {
      a: null,
      b: undefined,
      c: 0,
      d: false,
      e: ''
    };
    const qs = buildQueryString(params);

    qs.should.not.match(/a=null/);
    qs.should.match(/c=0/);
    qs.should.match(/d=false/);
    qs.should.match(/e=&?/);
    qs.should.not.match(/b=/);

    params.should.eql({
      a: null,
      b: undefined,
      c: 0,
      d: false,
      e: ''
    });

    done();
  });
});
