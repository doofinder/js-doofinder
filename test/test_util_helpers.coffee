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

  context "formatNumber", ->
    formatNumber = helpers.fn.formatNumber

    it "formats number according to the spec", (done) ->
      spec =
        symbol: '€'
        format: '%s%v-hi!'
        decimal: ','
        thousand: '.'

      (formatNumber 1234.56, spec).should.equal "€1.234,56-hi!"
      (formatNumber 1234, spec).should.equal "€1.234,00-hi!"
      done()

    it "can remove decimals for integers", (done) ->
      spec =
        symbol: ''
        format: '%s%v'
        forceDecimals: false

      (formatNumber 1234.56, spec).should.equal "1234.56"
      (formatNumber 1234, spec).should.equal "1234"
      done()

