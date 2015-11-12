###
# js-doofinder tests
# author: @ecoslado
# 2015 04 01
###

assert = require "assert"
should = require('chai').should()
doofinder = require "../lib/doofinder.js"

mock =
  request:
    hashid: "5886462410a02639acc5054bc464ec18"
	api_key: "eu1-384fd8a73c7ff0859a5891f9f4083b1b9727f9c3"
	query: "iphone"

describe 'doofinder', ->
  it 'should at least work', ->

  client = new doofinder.Client mock.request.hashid, mock.request.api_key
	
  client.addFilter "foo", ["bar"]
  client.filters.should.have.keys "foo"
  client.filters.foo.should.have.length 1
  client.filters.foo[0].should.equal "bar"
  querystring = client.makeQueryString()
