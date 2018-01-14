# required for testing
chai = require "chai"
extend = require "extend"

# chai
chai.should()
expect = chai.expect

# required for tests
Thing = require "../lib/util/thing"

describe "Thing", ->
  it "can detect an array of strings", (done) ->
    (Thing.is.stringArray ["a", "b", "c"]).should.be.true
    (Thing.is.stringArray "a").should.be.false
    (Thing.is.stringArray ["a", "b", 3]).should.be.false
    done()
