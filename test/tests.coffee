###
# js-doofinder tests
# author: @ecoslado
# 2015 04 01
###

assert = require "assert"
should = require('chai').should()
Doofinder = require "../lib/doofinder.js"

mock =
	request:
		hashid: "5886462410a02639acc5054bc464ec18"
		api_key: "eu1-384fd8a73c7ff0859a5891f9f4083b1b9727f9c3"
		query: "iphone"

describe 'doofinder', ->
	it 'should at least work', ->

	client = new Doofinder mock.request.hashid, mock.request.api_key
	
	client.add_filter "foo", ["bar"]
	client.filters.should.have.keys "foo"
	client.filters.foo.should.have.length 1
	client.filters.foo[0].should.equal "bar"

	client.add_filter_term "lorem", "ipsum"
	client.filters.should.have.keys "foo", "lorem"
	client.filters.lorem.should.have.length 1
	client.filters.lorem[0].should.equal "ipsum"

	client.add_filter_term "lorem", "whatever"
	client.filters.should.have.keys "foo", "lorem"
	client.filters.lorem.should.have.length 2
	client.filters.lorem[1].should.equal "whatever"

	client.add_filter_range "age", 2, 10
	client.filters.should.have.keys "foo", "lorem", "age"
	client.filters.age.should.have.property 'from', 2
	client.filters.age.should.have.property 'to', 10

	querystring = client.make_querystring()
	querystring.should.equal('hashid=5886462410a02639acc5054bc464ec18&query=&rpp=10&page=1&transformer=dflayer&filter%5Bfoo%5D=bar&filter%5Blorem%5D=ipsum&filter%5Blorem%5D=whatever&filter%5Bage%5D%5Bgte%5D=2&filter%5Bage%5D%5Blt%5D=10')