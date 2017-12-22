# required for testing
chai = require "chai"
extend = require "extend"

# chai
chai.should()
expect = chai.expect

# required for tests
uniqueId = require "../lib/util/uniqueid"

describe "uniqueId", ->
  context "dfid", ->
    it "can generate a dfid", (done) ->
      dfid = uniqueId.generate.dfid 1, "product", "3162d22da41ab3d2a03ebf335da66f01"
      dfid.should.equal "3162d22da41ab3d2a03ebf335da66f01@product@c4ca4238a0b923820dcc509a6f75849b"
      done()

    it "can validate a dfid", (done) ->
      dfid = "3162d22da41ab3d2a03ebf335da66f01@product@c4ca4238a0b923820dcc509a6f75849b"
      (uniqueId.clean.dfid dfid).should.equal dfid
      expect(-> uniqueId.clean.dfid "hola").to.throw()
      done()

  context "random", ->
    it "can generate random strings of variable width", (done) ->
      token = uniqueId.generate.easy()
      token.length.should.equal 8
      token.should.not.equal uniqueId.generate.easy()
      (uniqueId.generate.easy 10).should.not.equal (uniqueId.generate.easy 10)
      done()

    it "can generate random hashes", (done) ->
      hash = uniqueId.generate.hash()
      hash.length.should.equal 32
      hash.should.not.equal uniqueId.generate.hash()
      done()

  context "browser hash", ->
    it "can't be tested here... but works :-)", (done) ->
      hash = uniqueId.generate.browserHash()
      hash.length.should.equal 32
      hash.should.not.equal uniqueId.generate.hash()
      done()
