import 'mocha';
import { should } from 'chai';

// chai
should();

// tests
import * as Thing from '../src/util/is';
import { Zone } from '../src/types';

const ARRAY_SAMPLE = ["a", "b", "c"];
const OBJECT_SAMPLE = ((cls) => new cls())(class A {});
const PLAIN_OBJECT_SAMPLE = {a: 1, b: 2};
const STRING_SAMPLE = "hello";
const STRING_OBJ_SAMPLE = new String("hello");
const NUMBER_SAMPLE_INT = 123;
const NUMBER_SAMPLE_FLOAT = 123.45;

describe("Is Module", () => {
  it("can detect arrays", (done) => {
    Thing.isArray(ARRAY_SAMPLE).should.be.true;
    Thing.isArray(OBJECT_SAMPLE).should.be.false;
    Thing.isArray(PLAIN_OBJECT_SAMPLE).should.be.false;
    Thing.isArray(STRING_SAMPLE).should.be.false;
    Thing.isArray(STRING_OBJ_SAMPLE).should.be.false;
    Thing.isArray(NUMBER_SAMPLE_INT).should.be.false;
    Thing.isArray(NUMBER_SAMPLE_FLOAT).should.be.false;
    Thing.isArray(null).should.be.false;
    Thing.isArray(undefined).should.be.false;
    done();
  });

  it("can detect objects", (done) => {
    Thing.isObject(ARRAY_SAMPLE).should.be.false;
    Thing.isObject(OBJECT_SAMPLE).should.be.true;
    Thing.isObject(PLAIN_OBJECT_SAMPLE).should.be.true;
    Thing.isObject(STRING_SAMPLE).should.be.false;
    Thing.isObject(STRING_OBJ_SAMPLE).should.be.false;
    Thing.isObject(NUMBER_SAMPLE_INT).should.be.false;
    Thing.isObject(NUMBER_SAMPLE_FLOAT).should.be.false;
    Thing.isObject(null).should.be.false;
    Thing.isObject(undefined).should.be.false;
    done();
  });

  it("can detect plain objects", (done) => {
    Thing.isPlainObject(ARRAY_SAMPLE).should.be.false;
    Thing.isPlainObject(OBJECT_SAMPLE).should.be.false;
    Thing.isPlainObject(PLAIN_OBJECT_SAMPLE).should.be.true;
    Thing.isPlainObject(STRING_SAMPLE).should.be.false;
    Thing.isPlainObject(STRING_OBJ_SAMPLE).should.be.false;
    Thing.isPlainObject(NUMBER_SAMPLE_INT).should.be.false;
    Thing.isPlainObject(NUMBER_SAMPLE_FLOAT).should.be.false;
    Thing.isPlainObject(null).should.be.false;
    Thing.isPlainObject(undefined).should.be.false;
    done();
  });

  it("can detect strings", (done) => {
    Thing.isString(ARRAY_SAMPLE).should.be.false;
    Thing.isString(OBJECT_SAMPLE).should.be.false;
    Thing.isString(PLAIN_OBJECT_SAMPLE).should.be.false;
    Thing.isString(STRING_SAMPLE).should.be.true;
    Thing.isString(STRING_OBJ_SAMPLE).should.be.true;
    Thing.isString(NUMBER_SAMPLE_INT).should.be.false;
    Thing.isString(NUMBER_SAMPLE_FLOAT).should.be.false;
    Thing.isString(null).should.be.false;
    Thing.isString(undefined).should.be.false;
    done();
  });

  it("can detect numbers", (done) => {
    Thing.isNumber(ARRAY_SAMPLE).should.be.false;
    Thing.isNumber(OBJECT_SAMPLE).should.be.false;
    Thing.isNumber(PLAIN_OBJECT_SAMPLE).should.be.false;
    Thing.isNumber(STRING_SAMPLE).should.be.false;
    Thing.isNumber(STRING_OBJ_SAMPLE).should.be.false;
    Thing.isNumber(NUMBER_SAMPLE_INT).should.be.true;
    Thing.isNumber(NUMBER_SAMPLE_FLOAT).should.be.true;
    Thing.isNumber(null).should.be.false;
    Thing.isNumber(undefined).should.be.false;
    done();
  });

  it("can say if a zone is valid", (done) => {
    Thing.isValidZone('a').should.be.false;
    Thing.isValidZone(Zone.EU).should.be.true;
    done();
  });
});
