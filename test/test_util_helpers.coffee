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

  context "urlParams", ->
    it "works", (done) ->
      addUrlParams = helpers.fn.addUrlParams

      url = "https://www.fitnessdigital.com/showProducts.jsp?search=Polar+Vantage"
      params =
        "ct": 2
        "pp": 1
        "": ""
      res = "https://www.fitnessdigital.com/showProducts.jsp?search=Polar%20Vantage&ct=2&pp=1"

      """
      qs library:

      > RFC3986 used as default option and encodes ' ' to %20 which is backward
      > compatible. In the same time, output can be stringified as per RFC1738
      > with ' ' equal to '+'.

      We use the default so '+' will be re-encoded to %20.
      """

      addUrlParams(url, params).should.equal res
      done()
