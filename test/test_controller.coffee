# required for testing
chai = require "chai"
extend = require "extend"

# chai
chai.should()
expect = chai.expect

# required for tests
Client = require "../lib/client"
Controller = require "../lib/controller"

# config, utils & mocks
cfg = require "./config"
serve = require "./serve"

servePage = (page, query_counter, totalPages) ->
  rpp = 10
  params =
    page: page
    rpp: rpp
    query_counter: query_counter
    query_name: "match_and"
  delete params.query_name if page is 1
  response =
    page: page
    query_name: "match_and"
    total: rpp * totalPages
  serve.search params, response

testSecondaryPage = (triggerFn, testFn, totalPages) ->
  scope = servePage 1, 1, totalPages
  controller = cfg.getController()

  controller.one "df:resultsReceived", (res) ->
    scope.isDone().should.be.true

    getPageHandled = false
    nextPageHandled = false

    controller.one "df:getPage", (query, params) ->
      getPageHandled = true

    controller.one "df:nextPage", (query, params) ->
      nextPageHandled = true

    controller.one "df:resultsReceived", (res) ->
      res.getPageHandled = getPageHandled
      res.nextPageHandled = nextPageHandled
      testFn controller, res

    triggerFn controller

  controller.search ""

# test
describe "Controller", ->
  afterEach: ->
    serve.clean()

  context "Instantiation", ->
    it "needs a Client instance and can accept widgets and search parameters", (done) ->
      client = cfg.getClient()
      (-> new Controller()).should.throw()
      (-> new Controller client).should.not.throw()
      (-> new Controller client, 1).should.throw()
      (-> new Controller client, null, 1).should.throw()
      (-> new Controller client, [], {}).should.not.throw()
      # (-> new Controller client, [1], {}).should.throw() # TODO
      done()

    it "uses default parameters if none provided", (done) ->
      client = cfg.getClient()
      controller = new Controller client
      controller.hashid.should.equal client.hashid
      controller.defaults.page.should.equal 1
      controller.defaults.rpp.should.equal 10
      controller.queryCounter.should.equal 0
      done()

  context "Options", ->
    it "just calls Client's method", (done) ->
      scope = serve.options()
      controller = cfg.getController()
      controller.options null, (err, res) ->
        (expect err).to.be.undefined
        scope.isDone().should.be.true
        done()

  context "Search & Parameters", ->
    it "can use params and filters", (done) ->
      params =
        page: 2
        filter:
          brand: ["ADIDAS"]
        exclude:
          size: ["XXS"]

      controller = cfg.getController params

      # check initial params
      controller.params.page.should.equal 1
      controller.params.filter.brand.length.should.equal 1
      controller.params.filter.brand[0].should.equal "ADIDAS"
      controller.params.exclude.size.length.should.equal 1
      controller.params.exclude.size[0].should.equal "XXS"

      # remove non-existing filter value and add another one
      controller.removeFilter "brand", "PUMA"
      controller.addFilter "brand", "NIKE"

      controller.params.filter.brand.length.should.equal 2
      controller.params.filter.brand[0].should.equal "ADIDAS"
      controller.params.filter.brand[1].should.equal "NIKE"

      # remove existing filter value
      controller.removeFilter "brand", "ADIDAS"

      controller.params.filter.brand.length.should.equal 1
      controller.params.filter.brand[0].should.equal "NIKE"

      # remove entire filter
      controller.removeFilter "brand", "NIKE"
      (expect controller.params.filter.brand).to.be.undefined

      # add new filter, should be added as array
      controller.addFilter "size", "XXL"
      controller.params.filter.size.length.should.equal 1

      controller.removeFilter "size"
      (expect controller.params.filter.size).to.be.undefined

      # add new exclusion, should be added as array
      controller.addExclusion "brand", "NIKE"
      controller.params.exclude.brand.length.should.equal 1

      controller.addExclusion "size", ["XS"]
      controller.params.exclude.size.length.should.equal 2

      controller.addFilter "price", from: 10, to: 100
      (controller.getFilter "price").should.eql from: 10, to: 100
      controller.removeFilter "price", "anything"
      expect(controller.getFilter "price").to.be.undefined

      controller.setParam "nostats", true
      (controller.getParam "nostats").should.be.true
      controller.removeParam "nostats"
      expect(controller.getParam "nostats").to.be.undefined

      done()

    it "can search", (done) ->
      params =
        page: 1
        rpp: 10
        query_counter: 1

      scope = serve.search params, query_name: "match_and"

      controller = cfg.getController()

      controller.on "df:resultsReceived", (res) ->
        res.query_name.should.equal "match_and"
        controller.params.query_name.should.equal "match_and"
        scope.isDone().should.be.true
        done()

      controller.search ""

    it "can get the next page in the 2nd request", (done) ->
      scope = servePage 2, 2, 2

      triggerFn = (controller) ->
        controller.getNextPage()

      testFn = (controller, res) ->
        scope.isDone().should.be.true

        res.page.should.equal 2
        controller.lastPage.should.equal 2
        controller.isLastPage.should.be.true

        res.getPageHandled.should.be.true
        res.nextPageHandled.should.be.true
        done()

      testSecondaryPage triggerFn, testFn, 2

    it "can get 4th page of 5 in the 2nd request", (done) ->
      scope = servePage 4, 2, 5

      triggerFn = (controller) ->
        controller.getPage 4

      testFn = (controller, res) ->
        scope.isDone().should.be.true

        res.getPageHandled.should.be.true
        res.nextPageHandled.should.be.false

        res.page.should.equal 4
        res.query_counter.should.equal 2
        controller.lastPage.should.equal 5

        controller.isLastPage.should.be.false
        done()

      testSecondaryPage triggerFn, testFn, 5

  context "Widgets", ->
    it "can register widgets on initialization"
    it "can register/deregister widgets after initialization"

  context "Events", ->
    it "triggers df:search"
    it "triggers df:getPage"
    it "triggers df:nextPage"
    it "triggers df:refresh"
    it "triggers df:errorReceived"
    it "triggers df:resultsReceived"

  context "Status", ->
    it "can serialize search status to string"
    it "can de-serialize search status from string"
