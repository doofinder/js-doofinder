# required for testing
chai = require "chai"
extend = require "extend"

# chai
chai.should()
expect = chai.expect

# required for tests
uniqueId = require "../lib/util/uniqueid"
Stats = require "../lib/stats"

# config, utils & mocks
cfg = require "./config"
serve = require "./serve"

getStats = () ->
  client = cfg.getClient()
  new Stats client

# test
describe "Stats", ->
  afterEach: ->
    serve.clean()

  context "Instantiation", ->
    it "fails without a Client and a Session", (done) ->
      (-> new Stats()).should.throw()
      (-> new Stats cfg.getClient()).should.not.throw()
      done()

  context "Session Registration", ->
    it "registers session", (done) ->
      sessionId = "it's me"
      scope = serve.stats "init", session_id: sessionId
      stats = getStats session_id: sessionId
      stats.registerSession sessionId, (err, res) ->
        (expect err).to.be.undefined
        res.should.equal "OK"
        scope.isDone().should.be.true
        done()

  context "Clicks Registration", ->
    it "fails with no valid dfid", (done) ->
      sessionId = "it's me"
      stats = getStats()
      stats.registerClick.should.throw()
      (-> stats.registerClick sessionId, "someid").should.throw()
      done()

    it "success with a valid dfid", (done) ->
      sessionId = "it's me"
      params =
        dfid: uniqueId.generate.dfid "someid", "product", cfg.hashid
        session_id: sessionId
        query: "other thing"

      scope = serve.stats "click", params
      stats = getStats session_id: sessionId, query: "something"
      stats.registerClick sessionId, params.dfid, "other thing", (err, res) ->
        (expect err).to.be.undefined
        res.should.equal "OK"
        scope.isDone().should.be.true
        done()

  context "Checkout Registration", ->
    it "registers checkout", (done) ->
      sessionId = "it's me"
      scope = serve.stats "checkout", session_id: sessionId
      stats = getStats session_id: sessionId
      stats.registerCheckout sessionId, (err, res) ->
        (expect err).to.be.undefined
        res.should.equal "OK"
        scope.isDone().should.be.true
        done()

  context "Banner Events Registration", ->
    it "fails with no eventName or bannerId", (done) ->
      stats = getStats()
      stats.registerBannerEvent.should.throw()
      (-> stats.registerBannerEvent "display", undefined).should.throw()
      (-> stats.registerBannerEvent undefined, 1).should.throw()
      done()

    it "properly registers a banner event", (done) ->
      scope = serve.stats "banner_display", banner_id: "1"
      stats = getStats()
      stats.registerBannerEvent "display", 1, (err, res) ->
        (expect err).to.be.undefined
        res.should.equal "OK"
        scope.isDone().should.be.true
        done()
