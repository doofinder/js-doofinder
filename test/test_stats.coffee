# required for testing
chai = require "chai"
extend = require "extend"

# chai
chai.should()
expect = chai.expect

# tests config
cfg = require "./config"
serve = require "./serve"

# things we need
uniqueId = require "../lib/util/uniqueid"

# the thing being tested
Stats = require "../lib/stats"

getStats = (sessionData) ->
  client = cfg.getClient()
  session = cfg.getSession sessionData
  new Stats client, session

# test
describe "Stats", ->
  afterEach: ->
    serve.clean()

  context "Instantiation", ->
    it "fails without a Client and a Session", (done) ->
      (-> new Stats()).should.throw()
      (-> new Stats cfg.getClient()).should.throw()
      (-> new Stats cfg.getClient(), cfg.getSession()).should.not.throw()
      done()

  context "Session Registration", ->
    it "registers session if not already registered", (done) ->
      sessionId = "it's me"
      scope = serve.stats "init", session_id: sessionId
      stats = getStats session_id: sessionId
      (stats.session.get "registered", false).should.be.false
      stats.registerSession (err, res) ->
        (expect err).to.be.undefined
        res.should.equal "OK"
        (stats.session.get "registered").should.be.true
        (stats.session.get "session_id").should.equal sessionId
        scope.isDone().should.be.true
        done()

    it "doesn't register session if already registered", (done) ->
      sessionId = "it's me"
      scope = serve.stats "init", session_id: sessionId
      stats = getStats session_id: sessionId, registered: true
      (stats.session.get "registered").should.be.true
      stats.registerSession().should.be.false
      scope.isDone().should.be.false
      done()

  context "Search Registration", ->
    it "registers search", (done) ->
      stats = getStats()
      stats.session.exists().should.be.false
      stats.registerSearch "something"
      (stats.session.get "query").should.equal "something"
      stats.session.exists().should.be.true
      done()

  context "Clicks Registration", ->
    it "fails with no valid dfid", (done) ->
      stats = getStats()
      stats.registerClick.should.throw()
      (-> stats.registerClick "someid").should.throw()
      done()

    it "uses query from session if no query received as argument", (done) ->
      params =
        dfid: uniqueId.generate.dfid "someid", "product", cfg.hashid
        session_id: "hi"
        query: "something"

      scope = serve.stats "click", params
      stats = getStats session_id: "hi", query: "something"
      stats.registerClick params.dfid, null, (err, res) ->
        (expect err).to.be.undefined
        res.should.equal "OK"
        scope.isDone().should.be.true
        done()

    it "uses query from arguments if received", (done) ->
      params =
        dfid: uniqueId.generate.dfid "someid", "product", cfg.hashid
        session_id: "hi"
        query: "other thing"

      scope = serve.stats "click", params
      stats = getStats session_id: "hi", query: "something"
      stats.registerClick params.dfid, "other thing", (err, res) ->
        (expect err).to.be.undefined
        res.should.equal "OK"
        scope.isDone().should.be.true
        done()

  context "Checkout Registration", ->
    it "doesn't register checkout if there is no session", (done) ->
      scope = serve.stats "checkout"
      stats = getStats()
      stats.session.exists().should.be.false
      stats.registerCheckout().should.be.false
      scope.isDone().should.be.false
      done()

    it "properly registers checkout and cleans session if there is a session", (done) ->
      scope = serve.stats "checkout", session_id: "hi"
      stats = getStats session_id: "hi"
      stats.session.exists().should.be.true
      stats.registerCheckout (err, res) ->
        (expect err).to.be.undefined
        res.should.equal "OK"
        stats.session.exists().should.be.false
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
