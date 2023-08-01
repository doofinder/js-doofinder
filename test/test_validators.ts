// required for testing
import 'mocha';
import { should, expect } from 'chai';

// chai
should();

import { ValidationError, validateHashId, validateDoofinderId, validatePage, validateRpp, validateRequired } from '../src/util/validators';

const DFID: string = `6a96504dc173514cab1e0198af92e6e9@product@a1d0c6e83f027327d8461063f4ac58a6`;

describe('Validators', () => {
  it('validates hashids', done => {
    const hashid: string = '6a96504dc173514cab1e0198af92e6e9';
    validateHashId(hashid).should.equal(hashid);
    (() => validateHashId(null)).should.throw(ValidationError);
    (() => validateHashId(undefined)).should.throw(ValidationError);
    (() => validateHashId('hello world')).should.throw(ValidationError);
    done();
  });
  it('validates dfids', done => {
    validateDoofinderId(DFID).should.equal(DFID);
    (() => validateDoofinderId(null)).should.throw(ValidationError);
    (() => validateDoofinderId(undefined)).should.throw(ValidationError);
    (() => validateDoofinderId('hello world')).should.throw(ValidationError);
    done();
  });
  it('validates page param for searches', done => {
    validatePage(14).should.equal(14);
    validatePage('14').should.equal(14);
    expect(validatePage(undefined)).to.be.undefined;
    (() => validatePage(null)).should.throw(ValidationError);
    (() => validatePage(-1)).should.throw(ValidationError);
    done();
  });
  it('validates rpp param for searches', done => {
    validateRpp(10).should.equal(10);
    validateRpp('10').should.equal(10);
    expect(validateRpp(undefined)).to.be.undefined;
    (() => validateRpp(null)).should.throw(ValidationError);
    (() => validateRpp(-1)).should.throw(ValidationError);
    (() => validateRpp(101)).should.throw(ValidationError);
    done();
  });
  it('validates required values', done => {
    validateRequired(1, 'blah').should.equal(1);
    validateRequired([1, 2], 'blah').should.eql([1, 2]);
    (() => validateRequired(null, 'blah')).should.throw(ValidationError);
    (() => validateRequired(undefined, 'blah')).should.throw(ValidationError);
    (() => validateRequired([1, null], 'blah')).should.throw(ValidationError);
    (() => validateRequired([undefined, 2], 'blah')).should.throw(ValidationError);
    done();
  });
});
