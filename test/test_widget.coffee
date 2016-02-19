###
# js-doofinder tests
# author: @ecoslado
# 2015 04 01
###
assert = require "assert"
should = require('chai').should()
expect = require('chai').expect
jsdom = require "jsdom"
nock = require 'nock'

mock =
  request:
    hashid: "ffffffffffffffffffffffffffffffff"
    api_key: "eu1-384fd8a73c7ff0859a5891f9f4083b1b9727f9c3"

fake_results =
  query_counter: 1,
  results_per_page: 12,
  page: 1,
  total: 31,
  query: "some query",
  hashid: mock.request.hashid,
  max_score: 1.3,
  results: [
    {
      description: "Antena. 5.2 dBi. omnidireccional…",
      dfid: "523093f0ded16148dc005362",
      title: "Cisco Aironet Pillar Mount Diversity Omnidirectional Antenna",
      url: "http://www.example.com/product_description.html",
      image_url: "http://www.example.com/images/product_image.jpg",
      type: "product",
      id: "ID1"
    },
    {
      description: "Teclado. USB. España…",
      dfid: "523093f0ded16148dc0053xx",
    }
  ],
  query_name: "fuzzy"


# Test doofinder
describe 'doofinder widgets: ', ->

  beforeEach () ->
    global.document = jsdom.jsdom('<input id="query"></input>')
    global.window = document.defaultView
    global.navigator = window.navigator = {}
    navigator.userAgent = 'Nasty Navigator' # kudos to @jesusenlanet: great Name!
    navigator.appVersion = '0.0.1'
    global.doofinder = require "../lib/doofinder.js"
    @client = new doofinder.Client mock.request.hashid, mock.request.api_key

  afterEach () ->
    delete global.document
    delete global.doofinder

  context 'any widget ' , ->

    it 'can bind and trigger', (done) ->
      widget = new doofinder.Widget '#query'
      widget.bind 'test_event', (eventType, params) ->
        params.should.be.deep.equal {testKey: 'testValue'}
        done()

      widget.trigger 'test_event', {testKey: 'testValue'}


  context 'the queryInput widget', ->

    beforeEach () ->
      $ = doofinder.jQuery
      # reset the query input, to get rid of callbacks
      $('body').empty().append('<input type="text" id="query"></input>')
      @queryInput = $('#query')

    it 'triggers a search on third character', (done) ->
      queryInputWidget = new doofinder.widgets.QueryInput '#query'
      controller = new doofinder.Controller @client
      controller.addWidget queryInputWidget
      searchCalled = false
      controller.search = (query) ->
        searchCalled = true
        query.length.should.be.equal 3
        done()

      # two characters, nothing happens
      @queryInput.val 'ch'
      @queryInput.trigger 'keydown'
      searchCalled.should.be.false
      # three characters, search is triggered
      @queryInput.val 'cha'
      @queryInput.trigger 'keydown'

    it 'customize # of characters needed to trigger search', (done) ->
      queryInputWidget = new doofinder.widgets.QueryInput '#query', captureLength: 4
      controller = new doofinder.Controller @client
      controller.addWidget queryInputWidget
      searchCalled = false
      controller.search = (query) ->
        searchCalled = true
        query.length.should.be.equal 4
        done()
      # 3 characters, nothing happens
      @queryInput.val 'cha'
      @queryInput.trigger 'keydown'
      searchCalled.should.be.false
      # 4 characters, search is triggered
      @queryInput.val 'chai'
      @queryInput.trigger 'keydown'

  context 'the results widget', ->

    before () ->
      scope = nock('http://fooserver')
        .persist()
        .get('/5/search')
        .query(true)
        .reply((uri, requestBody)->
          query_counter = /query_counter=(\d+)/.exec(uri)[1]
          fake_results.query_counter = parseInt query_counter
          fake_results
        )

    beforeEach () ->
      @$ = doofinder.jQuery
      # reset the query input, to get rid of callbacks
      @$('body').empty().append('<input type="text" id="query"></input><div id="results"></div>')


    it 'display search results', (done) ->
      client = new doofinder.Client mock.request.hashid, mock.request.api_key,5,null,'fooserver'
      queryInputWidget = new doofinder.widgets.QueryInput '#query'
      resultsWidget = new doofinder.widgets.Results '#results'
      controller = new doofinder.Controller client
      controller.addWidget queryInputWidget
      controller.addWidget resultsWidget
      resultsContainer = @$ '#results'
      queryEl = @$ '#query'
      # when results are received, we check they're the "fake results"
      resultsContainer.on 'DOMSubtreeModified', () ->
        resultsEl = document.querySelector "#results"
        resultsContainer.find('li').length.should.be.equal 2
        resultsContainer.find('li b')[0].innerHTML.should.contain "Aironet"
        done()

      @$('#query').val 'sill'
      # search!
      @$('#query').trigger 'keydown'
