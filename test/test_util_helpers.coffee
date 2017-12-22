# required for testing
chai = require "chai"
extend = require "extend"

# chai
chai.should()
expect = chai.expect

# required for tests
addHelpers = require "../lib/util/helpers"

describe "Helpers", ->
  myContext =
    dummyHelper: true
    urlParams:
      whisky: true
      ron: false
    translations:
      hello: "hola"

  baseUrl = "https://www.doofinder.com"
  render = (text) -> text

  it "adds standard helpers to passed context", (done) ->
    helpers = addHelpers myContext
    helpers.dummyHelper.should.be.true
    helpers.urlParams.should.eql
      whisky: true
      ron: false
    expect(helpers["translate"]).not.to.be.undefined
    done()

  context "url-params", ->
    it "returns the same URL passed if no params from context", (done) ->
      helpers = addHelpers()
      fn = helpers["url-params"]()
      fn(baseUrl, render).should.equal baseUrl
      fn("#{baseUrl}?gin=sometimes", render).should.equal "#{baseUrl}?gin=sometimes"
      done()

    it "adds extra params if provided in the general context", (done) ->
      helpers = addHelpers myContext
      fn = helpers["url-params"]()
      fn(baseUrl, render).should.equal "#{baseUrl}?whisky=true&ron=false"
      fn("#{baseUrl}?gin=sometimes", render).should.equal "#{baseUrl}?gin=sometimes&whisky=true&ron=false"
      done()

  context "remove-protocol", ->
    it "does nothing if no protocol in the URL", (done) ->
      helpers = addHelpers()
      fn = helpers["remove-protocol"]()
      fn("//www.doofinder.com", render).should.equal "//www.doofinder.com"
      fn("//www.doofinder.comhttp://", render).should.equal "//www.doofinder.comhttp://"
      done()

    it "removes protocol if present", (done) ->
      helpers = addHelpers()
      fn = helpers["remove-protocol"]()
      fn(baseUrl, render).should.equal "//www.doofinder.com"
      fn("http://www.doofinder.com", render).should.equal "//www.doofinder.com"
      done()

  context "format-currency", ->
    it "can parse numbers provided as string", (done) ->
      helpers = addHelpers()
      fn = helpers["format-currency"]()
      (fn "1", render).should.equal "1€"
      (fn "1000.01", render).should.equal "1.000,01€"
      done()

    it "returns empty string if an invalid string is provided", (done) ->
      helpers = addHelpers()
      fn = helpers["format-currency"]()
      (fn "hello", render).should.equal ""
      done()

  context "translate", ->
    it "returns translated text if translation is available", (done) ->
      helpers = addHelpers myContext
      fn = helpers["translate"]()
      (fn "hello", render).should.equal "hola"
      done()

    it "returns the same text if no translation found", (done) ->
      helpers = addHelpers myContext
      fn = helpers["translate"]()
      (fn "bye", render).should.equal "bye"
      done()
