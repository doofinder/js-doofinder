# required for testing
chai = require "chai"

# chai
chai.should()
expect = chai.expect

# required for tests
helpers = require "../lib/util/helpers"

describe "Helpers", ->
  context "translate", ->
    it "returns translated text if translation is available", (done) ->
      translations =
        hello: "hola"
      myHelpers = helpers.addTranslateHelper {}, translations
      myHelpers.translate.should.not.be.undefined

      fn = myHelpers.translate()
      (fn "hello", (text) -> text).should.equal "hola"
      done()

    it "returns the same text if no translation found", (done) ->
      myHelpers = helpers.addTranslateHelper()
      myHelpers.translate.should.not.be.undefined

      fn = myHelpers.translate()
      (fn "hello", (text) -> text).should.equal "hello"
      done()
