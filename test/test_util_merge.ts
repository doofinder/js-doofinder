import 'mocha';
import { should } from 'chai';
import { merge } from '../src';

// chai
should();

describe('merge', () => {
  it('does not work for scalar values', done => {
    // @ts-ignore
    merge(1, '2', 3).should.eql({});
    done();
  });

  it('can merge arrays', done => {
    merge([1, 2], [3]).should.eql([3, 2]);
    done();
  });

  it('can merge objects', done => {
    merge({ a: 1 }, { b: 2 }, { c: 3 }).should.eql({ a: 1, b: 2, c: 3 });
    done();
  });

  it('can deeply merge', done => {
    merge(
      {},
      { a: [1, 2, { value: 3 }] },
      { a: [4, 5, { double: 6 }] }
    ).should.eql({
      a: [4, 5, { value: 3, double: 6 }]
    });
    done();
  });
});
