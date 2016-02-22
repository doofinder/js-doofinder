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
      @client = new doofinder.Client mock.request.hashid, mock.request.api_key

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

    beforeEach () ->
      scope = nock('http://fooserver')
        .get('/5/search')
        .query(true)
        .reply((uri, requestBody)->
          query_counter = /query_counter=(\d+)/.exec(uri)[1]
          fake_results.query_counter = parseInt query_counter
          fake_results
        )
      @$ = doofinder.jQuery
      # reset the query input, to get rid of callbacks
      @$('body').empty().append('<input type="text" id="query"></input><div id="results"></div>')
      # set up doofinder controller
      client = new doofinder.Client mock.request.hashid, mock.request.api_key,5,null,'fooserver'
      queryInputWidget = new doofinder.widgets.QueryInput '#query'
      @resultsWidget = new doofinder.widgets.Results '#results'
      @controller = new doofinder.Controller client, [queryInputWidget]
      # the els in questionr
      @resultsContainer = @$ '#results'
      @queryEl = @$ '#query'

    it 'display search results and triggers df:rendered', (done) ->
      resultsContainer = @resultsContainer
      @controller.addWidget @resultsWidget
      # DOM event comes first
      resultsContainer.one 'DOMSubtreeModified', () ->
        resultsContainer.find('li').length.should.be.equal 2
        resultsContainer.find('li b')[0].innerHTML.should.contain "Aironet"
      # df:rendered event comes second
      @resultsWidget.bind 'df:rendered', (event, res) ->
        res.results.length.should.be.equal 2
        done()
      @queryEl.val 'xill'
      @queryEl.trigger 'keydown' # search!

    it 'replaces search results', (done) ->
      # set up a second virtal response on the queue
      scope = nock('http://fooserver')
        .get('/5/search')
        .query(true)
        .reply((uri, requestBody)->
          query_counter = /query_counter=(\d+)/.exec(uri)[1]
          fake_results.query_counter = parseInt query_counter
          # remove last result
          fake_results.results.pop
          fake_results
        )
      resultsContainer = @resultsContainer
      queryEl = @queryEl
      @controller.addWidget @resultsWidget
      self = this
      resultsContainer.one 'DOMSubtreeModified', () ->
        resultsContainer.find('li').length.should.be.equal 2
        # after first search, get second page. previous content gets overwritten
        self.controller.nextPage()
        resultsContainer.one 'DOMSubtreeModified', () ->
          resultsContainer.find('li').length.should.be.equal 1
        done()
      # search and start the whole thing
      queryEl.val 'sill'
      queryEl.trigger 'keydown'

    it 'accepts custom templates, vars and functions', (done) ->
      # we add another results widget with alternate template
      @$('body').append('<div id="alt_results"></div>')
      template = '<ul>{{#results}}' +
        '            <li class="{{class_name}}">' +
        '               {{#bold}}{{title}}{{/bold}}:{{description}}<br></li>' +
        '            {{/results}}' +
        '         </ul>'
      altResultsWidget = new doofinder.widgets.Results '#alt_results',
        template: template,
        templateVars:
          class_name: 'custom_template'
        templateFunctions:
          bold: () ->
            (text, render) ->
              '<b class="custom">' + render(text) + '</b>'

      @controller.addWidget altResultsWidget
      self = this
      @$('#alt_results').on 'DOMNodeInserted', () ->
        self.$('#alt_results').find('li.custom_template').length.should.be.equal 2
        self.$('#alt_results').find('li b.custom').length.should.be.equal 2
        done()

      @queryEl.val 'zill'
      @queryEl.trigger 'keydown'

  context 'the scroll results widget', ->

    beforeEach () ->
      scope = nock('http://fooserver')
        .get('/5/search')
        .query(true)
        .reply((uri, requestBody)->
          query_counter = /query_counter=(\d+)/.exec(uri)[1]
          fake_results.query_counter = parseInt query_counter
          fake_results
        )
      @$ = doofinder.jQuery
      # reset the query input, to get rid of callbacks
      @$('body').empty().append('<input type="text" id="query"></input><div id="scroll"></div>')
      # set up doofinder controller
      client = new doofinder.Client mock.request.hashid, mock.request.api_key,5,null,'fooserver'
      queryInputWidget = new doofinder.widgets.QueryInput '#query'
      @scrollWidget = new doofinder.widgets.ScrollResults '#scroll'
      @controller = new doofinder.Controller client, [queryInputWidget]
      # the els in questionr
      @scrollContainer = @$ '#scroll'
      @queryEl = @$ '#query'

    it 'display search results and triggers df:rendered', (done) ->
      scrollContainer = @scrollContainer
      @controller.addWidget @scrollWidget
      # DOM event comes first
      scrollContainer.one 'DOMSubtreeModified', () ->
        scrollContainer.find('li').length.should.be.equal 2
        scrollContainer.find('li b')[0].innerHTML.should.contain "Aironet"
        done()
      # df:rendered event comes second
      # TEMPORARY COMMENTED UNTIL fix-double-df:triggering branch is merged
#      @resultsWidget.bind 'df:rendered', (event, res) ->
#        res.results.length.should.be.equal 2
#        done()
      @queryEl.val 'xill'
      @queryEl.trigger 'keydown' # search!

    it 'appends second page search results', (done) ->
      # set up a second virtal response on the queue
      scope = nock('http://fooserver')
        .get('/5/search')
        .query(true)
        .reply((uri, requestBody)->
          query_counter = /query_counter=(\d+)/.exec(uri)[1]
          fake_results.query_counter = parseInt query_counter
          # remove last result
          fake_results.results.pop()
          fake_results
        )
      scrollContainer = @scrollContainer
      @controller.addWidget @scrollWidget
      queryEl = @queryEl
      self = this

      scrollContainer.one 'DOMSubtreeModified', () -> # first nsearch
        scrollContainer.find('li').length.should.be.equal 2
        # after first search, get second page. previous content gets overwritten
        scrollContainer.one 'DOMSubtreeModified', () ->
          # now it's three (new results are appended)
          scrollContainer.find('li').length.should.be.equal 3
          done()
        self.controller.nextPage()

      # search and start the whole thing
      queryEl.val 'sill'
      queryEl.trigger 'keydown'
