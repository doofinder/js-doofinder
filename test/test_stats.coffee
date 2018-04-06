# required for testing
chai = require "chai"

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
    it "fails with invalid parameters", (done) ->
      getStats().registerSession.should.throw()
      done()

    it "registers session", (done) ->
      sessionId = "it's me"
      scope = serve.stats "init", session_id: sessionId
      stats = getStats()
      stats.registerSession sessionId, (err, res) ->
        (expect err).to.be.undefined
        res.should.equal "OK"
        scope.isDone().should.be.true
        done()

  context "Clicks Registration", ->
    it "fails with invalid parameters", (done) ->
      stats = getStats()
      stats.registerClick.should.throw()
      (-> stats.registerClick "sessionid").should.throw()
      done()

    buildRegisterClickTestFn = (scope, done) ->
      (err, res) ->
        (expect err).to.be.undefined
        res.should.equal "OK"
        scope.isDone().should.be.true
        done()

    it "registers clicks with dfid", (done) ->
      params =
        dfid: uniqueId.dfid.create "someid", "product", cfg.hashid
        session_id: "42"
        query: "other thing"
      scope = serve.stats "click", params
      getStats().registerClick params.session_id,
                               params.dfid,
                               params.query,
                               (buildRegisterClickTestFn scope, done)

    it "registers clicks with id and datatype", (done) ->
      params =
        id: "someid"
        datatype: "product"
        session_id: "42"
        query: "other thing"

      scope = serve.stats "click", params
      getStats().registerClick params.session_id,
                               params.id,
                               params.datatype,
                               params.query,
                               (buildRegisterClickTestFn scope, done)

    it "breaks if not enough arguments where passed", (done) ->
      id = "someid"
      datatype = "product"
      dfid = uniqueId.dfid.create id, datatype, cfg.hashid
      session_id = "42"
      query = "other thing"

      stats = getStats()

      (-> stats.registerClick()).should.throw
      (-> stats.registerClick(session_id)).should.throw
      (-> stats.registerClick(session_id, id)).should.throw

      done()

    # TODO: move text.dfid stuff to unique_id

  context "Checkout Registration", ->
    it "fails with invalid parameters", (done) ->
      getStats().registerCheckout.should.throw()
      done()

    it "registers checkout", (done) ->
      sessionId = "it's me"
      scope = serve.stats "checkout", session_id: sessionId
      stats = getStats()
      stats.registerCheckout sessionId, (err, res) ->
        (expect err).to.be.undefined
        res.should.equal "OK"
        scope.isDone().should.be.true
        done()

  context "Banner Events Registration", ->
    it "fails with no eventName or bannerId", (done) ->
      stats = getStats()
      stats.registerBannerEvent.should.throw()
      (-> stats.registerBannerEvent "display").should.throw()
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
