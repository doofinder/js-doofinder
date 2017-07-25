# required for testing
chai = require "chai"
nock = require "nock"
extend = require "extend"

# chai
chai.should()
expect = chai.expect

# required for some tests
http = require "http"
https = require "https"

# the thing being tested
Client = require "../lib/client"

# config
HASHID = "ffffffffffffffffffffffffffffffff"
ZONE = "eu1"

HOST = "#{ZONE}-search.doofinder.com"
ADDRESS = "https://#{HOST}"

AUTH = "aaaaaaaaaabbbbbbbbbbccccccccccdddddddddd"
APIKEY = "#{ZONE}-#{AUTH}"

VERSION = 5

# utils & mocks
getClient = (type) ->
  new Client HASHID, APIKEY, undefined, type

buildQuery = (query, params) ->
  getClient().__buildSearchQueryString query, params

serve =
  request: (code = 200, text = '{}') ->
    ((nock ADDRESS).get "/somewhere").reply code, text

  requestError: (error) ->
    ((nock ADDRESS).get "/somewhere").replyWithError error

  options: (suffix) ->
    resource = "/#{VERSION}/options/#{HASHID}"
    resource = "#{resource}?#{suffix}" if suffix?
    ((nock ADDRESS).get resource).reply 200, "{}"

  search: (params) ->
    resource = "/#{VERSION}/search"
    defaultParams =
      hashid: HASHID
      page: 1
      rpp: 10
      query: ''
    params = extend true, defaultParams, (params or {})
    (((nock ADDRESS).get resource).query params).reply 200, '{}'

  stats: (type, params) ->
    resource = "/#{VERSION}/stats/#{type}"
    defaultParams =
      hashid: HASHID
      random: 0
    params = extend true, defaultParams, (params or {})
    (((nock ADDRESS).get resource).query params).reply 200, '"OK"'

# test
describe "Client", ->
  afterEach: ->
    console.log
    nock.cleanAll()

  context "Instantiation", ->
    context "without API key", ->
      it "should use regular HTTP library", (done) ->
        client = new Client HASHID, ZONE
        client.httpClient.secure.should.be.false
        client.httpClient.http.should.equal http
        done()

    context "with API key", ->
      it "should use HTTPS", (done) ->
        client = getClient()
        client.httpClient.secure.should.be.true
        client.httpClient.http.should.equal https
        client.defaultOptions.headers.authorization.should.equal AUTH
        done()

    context "API version", ->
      it "should use default version if not defined", (done) ->
        client = getClient()
        client.version.should.equal "#{VERSION}"
        done()

      it "should use custom version if defined", (done) ->
        client = new Client HASHID, APIKEY, 6
        client.version.should.equal "6"
        done()

    context "Custom Address", ->
      it "should use default address if not defined", (done) ->
        client = getClient()
        client.defaultOptions.host.should.equal HOST
        expect(client.defaultOptions.port).to.be.undefined
        done()

      it "should use custom address if defined", (done) ->
        client = new Client HASHID, APIKEY, null, null, "localhost:4000"
        client.defaultOptions.host.should.equal "localhost"
        client.defaultOptions.port.should.equal "4000"
        done()

  context "Request", ->
    it "needs a path and a callback", (done) ->
      client = getClient()

      client.request.should.throw()
      (-> client.request "/somewhere").should.throw()

      scope = serve.request()
      (-> client.request "/somewhere", ->).should.not.throw()
      scope.isDone().should.be.true

      done()

    it "handles request errors via callbacks", (done) ->
      scope = serve.requestError code: "AWFUL_ERROR"
      getClient().request "/somewhere", (err, response) ->
        err.code.should.equal "AWFUL_ERROR"
        scope.isDone().should.be.true
        done()

    it "handles response errors via callbacks", (done) ->
      scope = serve.request 404, 'not found'
      getClient().request "/somewhere", (err, response) ->
        err.should.equal 404
        (expect response).to.be.undefined
        scope.isDone().should.be.true
        done()

    it "handles response success via callbacks", (done) ->
      scope = serve.request()
      getClient().request "/somewhere", (err, response) ->
        (expect err).to.be.undefined
        response.should.eql {}
        scope.isDone().should.be.true
        done()

  context "Options", ->
    it "needs a callback", (done) ->
      client = getClient()

      client.options.should.throw()
      (-> client.options {}).should.throw()
      (-> client.options "hello").should.throw()

      scope = serve.options()
      (-> client.options ->).should.not.throw()
      scope.isDone().should.be.true

      done()

    it "assumes callback and no suffix when called with one arguments", (done) ->
      scope = serve.options()
      request = getClient().options (err, response) ->
        request.path.should.equal "/#{VERSION}/options/#{HASHID}"
        response.should.eql {}
        scope.isDone().should.be.true
        done()

    it "assumes callback and suffix when called with two arguments", (done) ->
      scope = serve.options "example.com"
      request = getClient().options "example.com", (err, response) ->
        request.path.should.equal "/#{VERSION}/options/#{HASHID}?example.com"
        response.should.eql {}
        scope.isDone().should.be.true
        done()

  context "Search", ->
    it "can be called with 2 or 3 arguments; the last one must be a callback", (done) ->
      client = getClient()

      client.search.should.throw()
      (-> (client.search "something")).should.throw()
      (-> (client.search "something", {})).should.throw()

      scope = serve.search query: "something"
      (-> (client.search "something", {}, ->)).should.not.throw()
      scope.isDone().should.be.true

      scope = serve.search query: "something"
      (-> (client.search "something", ->)).should.not.throw()
      scope.isDone().should.be.true

      done()

    context "Basic Parameters", ->
      it "uses default basic parameters if none set", (done) ->
        querystring = "hashid=#{HASHID}&page=1&rpp=10&query="
        buildQuery().should.equal querystring
        done()

      it "accepts different basic parameters than the default ones", (done) ->
        querystring = "hashid=#{HASHID}&page=2&rpp=100&hello=world&query="
        (buildQuery undefined, page: 2, rpp: 100, hello: "world").should.equal querystring
        done()

    context "Types", ->
      it "specifies no type if no specific type was set", (done) ->
        querystring = "hashid=#{HASHID}&page=1&rpp=10&query="
        (buildQuery undefined, type: undefined).should.equal querystring
        (buildQuery undefined, type: null).should.equal querystring
        done()

      it "handles one type if set", (done) ->
        querystring = "hashid=#{HASHID}&type=product&page=1&rpp=10&query="
        (buildQuery undefined, type: "product").should.equal querystring
        (buildQuery undefined, type: ["product"]).should.equal querystring
        done()

      it "handles several types if set", (done) ->
        querystring = [
          "hashid=#{HASHID}&type%5B0%5D=product&type%5B1%5D=recipe",
          "&page=1&rpp=10&query="
        ].join ""
        (buildQuery undefined, type: ["product", "recipe"]).should.equal querystring
        done()

    context "Filters", ->
      # Exclusion filters are the same with a different key so not testing here.

      it "handles terms filters", (done) ->
        querystring = [
          "hashid=#{HASHID}&page=1&rpp=10&filter%5Bbrand%5D=NIKE",
          "&filter%5Bcategory%5D%5B0%5D=SHOES&filter%5Bcategory%5D%5B1%5D=SHIRTS",
          "&query="
        ].join ""
        params =
          filter:
            brand: "NIKE"
            category: ["SHOES", "SHIRTS"]
        (buildQuery undefined, params).should.equal querystring
        done()

      it "handles range filters", (done) ->
        querystring = [
          "hashid=#{HASHID}&page=1&rpp=10&filter%5Bprice%5D%5Bfrom%5D=0",
          "&filter%5Bprice%5D%5Bto%5D=150&query="
        ].join ""
        params =
          filter:
            price:
              from: 0
              to: 150
        (buildQuery undefined, params).should.equal querystring
        done()

    context "Sorting", ->
      it "accepts a single field name to sort on", (done) ->
        querystring = "hashid=#{HASHID}&page=1&rpp=10&sort=brand&query="
        (buildQuery undefined, sort: "brand").should.equal querystring
        done()

      it "accepts an object for a single field to sort on", (done) ->
        querystring = "hashid=#{HASHID}&page=1&rpp=10&sort%5Bbrand%5D=desc&query="
        sorting =
          brand: "desc"
        (buildQuery undefined, sort: sorting).should.equal querystring
        done()

      it "fails with an object for a multiple fields to sort on", (done) ->
        sorting =
          "_score": "desc"
          brand: "asc"
        (-> (buildQuery undefined, sort: sorting)).should.throw()
        done()

      it "accepts an array of objects for a multiple fields to sort on", (done) ->
        querystring = [
          "hashid=#{HASHID}&page=1&rpp=10&sort%5B0%5D%5B_score%5D=desc",
          "&sort%5B1%5D%5Bbrand%5D=asc&query="
        ].join ""
        sorting = [
            "_score": "desc"
          ,
            brand: "asc"
        ]
        (buildQuery undefined, sort: sorting).should.equal querystring
        done()

  context "Stats", ->
    it "must be called with all arguments, the last one is the callback", (done) ->
      client = getClient()

      client.stats.should.throw()
      (-> (client.stats "count", random: 0)).should.throw()

      scope = serve.stats "count"
      (-> (client.stats "count", random: 0, ->)).should.not.throw()
      scope.isDone().should.be.true

      done()

