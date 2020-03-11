// required for testing
import 'mocha';
import { should, expect } from 'chai';

// chai
should();

import { ValidationError, validateHashId, validateDoofinderId, validatePage, validateRpp, validateRequired, validateItems } from '../src/util/validators';

const DFID: string = `6a96504dc173514cab1e0198af92e6e9@product@a1d0c6e83f027327d8461063f4ac58a6`;

describe('Validators', () => {
  it('validates hashids', done => {
    validateHashId('6a96504dc173514cab1e0198af92e6e9').should.be.true;
    (() => validateHashId(null)).should.throw(ValidationError);
    (() => validateHashId(undefined)).should.throw(ValidationError);
    (() => validateHashId('hello world')).should.throw(ValidationError);
    done();
  });
  it('validates dfids', done => {
    validateDoofinderId(DFID).should.be.true;
    (() => validateDoofinderId(null)).should.throw(ValidationError);
    (() => validateDoofinderId(undefined)).should.throw(ValidationError);
    (() => validateDoofinderId('hello world')).should.throw(ValidationError);
    done();
  });
  it('validates page param for searches', done => {
    validatePage(14).should.be.true;
    validatePage(undefined).should.be.true;
    (() => validatePage(null)).should.throw(ValidationError);
    (() => validatePage('14')).should.throw(ValidationError);
    (() => validatePage(-1)).should.throw(ValidationError);
    done();
  });
  it('validates rpp param for searches', done => {
    validateRpp(10).should.be.true;
    validateRpp(undefined).should.be.true;
    (() => validateRpp(null)).should.throw(ValidationError);
    (() => validateRpp('10')).should.throw(ValidationError);
    (() => validateRpp(-1)).should.throw(ValidationError);
    (() => validateRpp(101)).should.throw(ValidationError);
    done();
  });
  it('validates items param for searches', done => {
    validateItems([DFID]).should.be.true;
    (() => validateItems([DFID, `hello world`])).should.throw(ValidationError);
    (() => validateItems([42])).should.throw(ValidationError);
    done();
  });
  it('validates required values', done => {
    validateRequired(1, 'blah').should.be.true;
    validateRequired([1, 2], 'blah').should.be.true;
    (() => validateRequired(null, 'blah')).should.throw(ValidationError);
    (() => validateRequired(undefined, 'blah')).should.throw(ValidationError);
    (() => validateRequired([1, null], 'blah')).should.throw(ValidationError);
    (() => validateRequired([undefined, 2], 'blah')).should.throw(ValidationError);
    done();
  });
});
