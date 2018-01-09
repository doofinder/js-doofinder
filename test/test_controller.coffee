# required for testing
chai = require "chai"
extend = require "extend"

# chai
chai.should()
expect = chai.expect

# required for tests
Client = require "../lib/client"
Controller = require "../lib/controller"
Widget = require "../lib/widgets/widget"

# config, utils & mocks
cfg = require "./config"
serve = require "./serve"

qs = require "qs"


class WidgetMock extends Widget
  setElement: (@element) ->
  render: (res) ->
    @rendered = true
  trigger: (eventName, args = []) ->

###*
 * Configures nock to serve a search mock for a specific status.
 *
 * @param  {Number}  page          Page to serve.
 * @param  {Number}  totalPages    Total pages of results for this search.
 * @param  {Number}  queryCounter  Number of queries supposed to have been sent.
 * @param  {Boolean} refresh       If this request is a refresh (false by
 *                                 default). If true, it adds the query_name to
 *                                 the request params.
 * @return {Scope}                 nock's Scope.
###
serveSearchPage = (page, totalPages, queryCounter, refresh = false) ->
  params =
    page: page
    rpp: 10
    query: "something"
    query_counter: queryCounter

  if page > 1 or refresh
    params.query_name = "match_and"

  response =
    query_name: "match_and"
    total: 10 * totalPages

  serve.search params, response

###*
 * Tests a page obtained after a first page request, via getPage() or
 * getNextPage().
 *
 * @param  {Number}   anotherPage         Page to be tested.
 * @param  {Number}   totalPages          Total pages of results.
 * @param  {Number}   anotherQueryCounter Number of queries supposed to have
 *                                        been sent.
 * @param  {Function} searchTestFn        Function with extra tests and done().
 * @return {http.ClientRequest}           First request sent by the controller.
###
testAnotherPage = (controller, anotherPage, totalPages, anotherQueryCounter, searchTestFn) ->
  firstPageRequest = serveSearchPage 1, totalPages, 1
  anotherPageRequest = serveSearchPage anotherPage, totalPages, anotherQueryCounter
  pageHandled = false

  # Handler for first page search. It configures handlers for the actual request
  # we want to test.
  controller.one "df:results:success", (res) ->
    firstPageRequest.isDone().should.be.true

    # Save the page we are requesting in the controller.
    # It should be equal to the page we want to test.
    # This event is triggered before the request is actually made.
    controller.one "df:search:page", (query, params) ->
      pageHandled = params.page
      pageHandled.should.equal anotherPage

    # One-time handler to get results received by the controller. Some basic
    # tests are done.
    # This event is triggered after the response is processed.
    controller.one "df:results:success", (res) ->
      anotherPageRequest.isDone().should.be.true

      # The response matches the requested page and query counter
      res.page.should.equal pageHandled
      res.query_counter.should.equal anotherQueryCounter

      # Perform extra tests outside this wrapper
      searchTestFn controller, res

    # launch the secondary page request
    if anotherPage is 2
      controller.getNextPage()
    else
      controller.getPage anotherPage

  # search (first page)
  controller.search "something"

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
      (-> new Controller client, {}).should.not.throw()
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
        query: ""
        hashid: cfg.hashid
        page: 1
        rpp: 10
        query_counter: 1

      response =
        query: ""
        hashid: cfg.hashid
        page: 1
        results_per_page: 10
        query_counter: 1
        query_name: "match_and"

      scope = serve.search params, response

      controller = cfg.getController()

      searchTriggered = false
      controller.one "df:search", (query, params) ->
        # inside controller
        @query.should.equal query
        @params.should.eql params
        searchTriggered = true

      controller.one "df:results:success", (res) ->
        scope.isDone().should.be.true
        searchTriggered.should.be.true

        res.query_name.should.equal "match_and"
        controller.params.query_name.should.equal "match_and"
        done()

      controller.search ""

    it "can get the next page in the 2nd request", (done) ->
      testAnotherPage cfg.getController(), 2, 2, 2, (controller, res) ->
        controller.lastPage.should.equal 2
        controller.isLastPage.should.be.true
        done()

    it "can get 4th page of 5 in the 2nd request", (done) ->
      testAnotherPage cfg.getController(), 4, 5, 2, (controller, res) ->
        controller.lastPage.should.equal 5
        controller.isLastPage.should.be.false
        done()

    it "can refresh current search", (done) ->
      query = "something"
      queryName = "match_and"

      firstRequest = serveSearchPage 1, 5, 1
      secondRequest = serveSearchPage 1, 5, 2, true

      controller = cfg.getController()

      # 1st request handler
      controller.one "df:results:success", (res) ->
        firstRequest.isDone().should.be.true
        secondRequest.isDone().should.be.false

        # test details of the first request
        controller.query.should.equal query
        controller.params.page.should.equal 1
        controller.queryCounter.should.equal 1
        res.query_counter.should.equal 1
        controller.params.query_name.should.equal queryName

        # 2nd request handler (on request)
        refreshTriggered = false
        controller.one "df:refresh", (query, params) ->
          # inside controller
          @query.should.equal query
          @params.should.eql params
          refreshTriggered = true

        # 2nd request handler (on response)
        controller.one "df:results:success", (res) ->
          secondRequest.isDone().should.be.true
          refreshTriggered.should.be.true

          controller.query.should.equal query
          controller.params.page.should.equal 1
          controller.queryCounter.should.equal 2
          res.query_counter.should.equal 2
          controller.params.query_name.should.equal queryName

          done()

        # 2nd request
        controller.refresh()

      # 1st request
      controller.search query

    it "triggers df:results:error in case of error", (done) ->
      scope = serve.forbidden()
      controller = cfg.getController()

      controller.one "df:results:error", (err) ->
        scope.isDone().should.be.true
        err.should.equal 403
        done()

      controller.search ""

  context "Widgets", ->
    it "can register widgets after initialization", (done) ->
      widget = new WidgetMock()
      controller = new Controller cfg.getClient()
      controller.registerWidget widget
      controller.widgets.length.should.equal 1
      controller.widgets[0].should.equal widget
      widget.controller.should.equal controller
      controller.registerWidgets [new WidgetMock(), new WidgetMock()]
      controller.widgets.length.should.equal 3
      done()

    it "makes widgets render when a search response is received", (done) ->
      controller = new Controller cfg.getClient()
      controller.registerWidgets [new WidgetMock(), new WidgetMock()]
      testAnotherPage controller, 4, 5, 2, (controller, res) ->
        for widget in controller.widgets
          widget.rendered.should.be.true
        done()

  context "Status", ->
    it "can serialize search status to string", (done) ->
      controller = cfg.getController()
      controller.serializeStatus().should.equal ""
      controller.reset "hola", query_name: "match_and", transformer: null, rpp: 10, page: 1
      controller.serializeStatus().should.equal "query=hola&query_name=match_and"
      done()

    it "does not perform request when de-serializing empty status", (done) ->
      controller = cfg.getController()
      (controller.loadStatus "").should.be.false
      (expect controller.query).to.be.null
      (expect controller.params.query_name).to.be.undefined
      controller.params.page.should.equal 1
      controller.params.rpp.should.equal 10
      controller.params.should.eql controller.defaults
      controller.requestDone.should.be.false
      serve.clean()
      done()

    it "performs a request when de-serializing a non-empty search status from string", (done) ->
      controller = cfg.getController rpp: 20

      controller.one "df:results:success", (res) ->
        controller.serializeStatus().should.equal "query=hola&query_name=match_and"
        scope.isDone().should.be.true
        done()

      params =
        query: "hola"
        query_name: "match_and"
        rpp: 20
        page: 1
        query_counter: 1

      scope = serve.search params
      status = controller.loadStatus "query=hola&query_name=match_and"
      status.should.not.be.false
      status.query.should.equal "hola"
      status.query_name.should.equal "match_and"

      controller.query.should.equal "hola"
      controller.params.query_name.should.equal "match_and"
      controller.params.page.should.equal 1
      controller.params.rpp.should.equal 20
      controller.requestDone.should.be.true
