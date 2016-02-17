###
# js-doofinder tests
# author: @ecoslado
# 2015 04 01
###
assert = require "assert"
should = require('chai').should()
expect = require('chai').expect

mock =
  request:
    hashid: "ffffffffffffffffffffffffffffffff"
    api_key: "eu1-384fd8a73c7ff0859a5891f9f4083b1b9727f9c3"
  selector: "#query"

# Test doofinder
describe 'doofinder widgets: ', ->

  beforeEach () ->
    global.document = require("jsdom").jsdom('<input id="query"></input>')
    global.window = document.defaultView
    global.navigator = window.navigator = {}
    navigator.userAgent = 'Nasty Navigator' # kudos to @jesusenlanet: great Name!
    navigator.appVersion = '0.0.1'
    global.doofinder = require "../lib/doofinder.js"

  context 'any widget ' , ->

    it 'can bind and trigger', (done) ->
      widget = new doofinder.Widget mock.selector
      widget.bind 'test_event', (eventType, params) ->
        params.should.be.deep.equal {testKey: 'testValue'}
        done()

      widget.trigger 'test_event', {testKey: 'testValue'}

  # queryInput widget
  describe 'the queryInput widget', ->

    before () ->
      @$ = doofinder.jQuery

    beforeEach () ->
      @client = new doofinder.Client mock.request.hashid, mock.request.api_key

    afterEach () ->
      delete @client
      delete @controller

    it 'trigger a search on third character', (done) ->
      queryInput = @$ '#query'
      queryInputWidget = new doofinder.widgets.QueryInput '#query'
      controller = new doofinder.Controller @client
      controller.addWidget queryInputWidget
      searchCalled = false
      controller.search = (query) ->
        searchCalled = true
        query.length.should.be.equal 3
        done()

      # two characters, nothing happens
      queryInput.val 'ch'
      queryInput.trigger 'keydown'
      searchCalled.should.be.equal false
      # three characters, search is triggered
      queryInput.val 'cha'
      queryInput.trigger 'keydown'

    it 'customize # of characters needed to trigger search', (done) ->
      @$('#query').remove()
      @$('body').append('<input type="text" id="query"></input>')
      queryInput = @$('#query')
      queryInputWidget = new doofinder.widgets.QueryInput '#query', captureLength: 4
      controller2 = new doofinder.Controller @client
      controller2.addWidget queryInputWidget
      searchCalled = false
      controller2.search = (query) ->
        searchCalled = true
        query.length.should.be.equal 4
        done()
      # 3 characters, nothing happens
      queryInput.val 'cha'
      queryInput.trigger 'keydown'
      searchCalled.should.be.equal false
      # 4 characters, search is triggered
      queryInput.val 'chai'
      queryInput.trigger 'keydown'
