# required for testing
chai = require "chai"

# chai
chai.should()
expect = chai.expect

# required for tests
Thing = require "../lib/util/thing"

class Person
  constructor: (@name = "John Smith") ->

# DRY

arrays    = [[], new Array()]
objs      = [{}, new Object()]
otherObjs = [new Person()]
others    = [1, new Number(), new Date()]
text      = ["", new String()]
fn        = [->]

testTrue = (fn, data)->
  for group in data
    for value in group
      (fn value).should.be.true

testFalse = (fn, data)->
  for group in data
    for value in group
      (fn value).should.be.false

describe "Things Introspection:", ->
  context "Objects:", ->
    it "can detect objects", (done) ->
      testTrue  Thing.isObj, [objs, otherObjs]
      testFalse Thing.isObj, [arrays, fn, others, text]
      done()

    it "can detect plain objects", (done) ->
      testTrue  Thing.isPlainObj, [objs]
      testFalse Thing.isPlainObj, [arrays, fn, otherObjs, others, text]
      done()

  context "Strings:", ->
    it "can detect strings", (done) ->
      testTrue  Thing.isStr, [text]
      testFalse Thing.isStr, [arrays, fn, objs, otherObjs, others]
      done()

    it "can detect string literals", (done) ->
      (Thing.isStrLiteral "").should.be.true
      (Thing.isStrLiteral new String()).should.be.false
      done()

  context "Arrays:", ->
    it "can detect arrays", (done) ->
      testTrue  Thing.isArray, [arrays]
      testFalse Thing.isArray, [fn, objs, otherObjs, others, text]
      done()

    it "can detect arrays of text", (done) ->
      (Thing.isStrArray ["a", "b", new String "c"]).should.be.true
      (Thing.isStrArray ["a", "b", 1]).should.be.false
      (Thing.isStrArray []).should.be.true
      done()

  context "Functions:", ->
    it "can detect functions", (done) ->
      testTrue  Thing.isFn, [fn]
      testFalse Thing.isFn, [arrays, objs, otherObjs, others, text]
      done()

  context "Primitives:", ->
    it "can detect primitives", (done) ->
      somePrimitives = [null, undefined, "", 1, true, false]
      someObjs = [new Number(), new Date(), new String()]

      testTrue  Thing.isPrimitive, [somePrimitives]
      testFalse Thing.isPrimitive, [arrays, fn, objs, otherObjs, someObjs]
      done()
