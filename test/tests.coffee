###
# js-doofinder tests
# author: @ecoslado
# 2015 04 01
###

assert = require "assert"
should = require('chai').should()
Doofinder = require "../lib/doofinder.js"

mock =
	url: "localhost"
	port: "8881"
	hashid: "5886462410a02639acc5054bc464ec18"
	api_key: "eu1-384fd8a73c7ff0859a5891f9f4083b1b9727f9c3"
	query: "iphone"

describe 'doofinder', ->
	it 'should at least work', ->

	client = new Doofinder mock.hashid, mock.api_key, mock.url, mock.port

	client.search (err, res) ->
		err.should.be.null
		res.should.be.not.null