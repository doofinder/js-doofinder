###
# js-doofinder tests
# author: @ecoslado
# 2015 04 01
###

assert = require "assert"
should = require('chai').should()
expect = require('chai').expect
doofinder = require "../lib/doofinder.js"



mock =
  request:
    hashid: "ffffffffffffffffffffffffffffffff"
    api_key: "eu1-384fd8a73c7ff0859a5891f9f4083b1b9727f9c3"
  selector: "#query"

# Test doofinder
describe 'doofinder widgets: ', ->

  # Tests the widget's stuff
  describe 'the results widget', ->

    before () ->
      @client = new doofinder.Client mock.request.hashid, mock.request.api_key
      @controller = new doofinder.Controller @client


    it 'bind and trigger', (done) ->
      widget = new doofinder.Widget mock.selector
      widget.bind 'test_event', (eventType, params) ->
        params.should.be.deep.equal {testKey: 'testValue'}
        done()
     
      widget.trigger 'test_event', {testKey: 'testValue'}
