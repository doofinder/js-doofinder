import 'mocha';
import { should } from 'chai';

// chai
should();

// tests
import * as Thing from '../src/util/is';

describe("Is Module", () => {
  it("can detect an array", (done) => {
    (Thing.isArray(["a", "b", "c"])).should.be.true;
    (Thing.isArray("a")).should.be.false;
    (Thing.isArray(["a", "b", 3])).should.be.true;
    done();
  });

  it("can tell an array from an object", (done) => {
    const obj = {a: 1, b: 2};
    const arr = ["a", "b", 3];

    (Thing.isArray(obj)).should.be.false;
    (Thing.isArray(arr)).should.be.true;
    (Thing.isObject(obj)).should.be.true;
    (Thing.isObject(arr)).should.be.false;
    (Thing.isPlainObject(obj)).should.be.true;
    (Thing.isPlainObject(arr)).should.be.false;

    done();
  });
});
