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
    hashid: "ffffffffffffffffffffffffffffffff"
  api_key: "eu1-384fd8a73c7ff0859a5891f9f4083b1b9727f9c3"
  query: "iphone"

# Test doofinder
describe 'doofinder', ->

  # Tests the client's stuff
  describe 'client', ->

    it 'multiTypeClient', ->
      # Client for two types by constructor (made make multiple type params)
      client = new doofinder.Client mock.request.hashid, mock.request.api_key, 5, ['product', 'category']
      querystring = client.makeQueryString()
      querystring.should.be.equal 'hashid=ffffffffffffffffffffffffffffffff&type=product&type=category'

    it 'addFilter', ->
      client = new doofinder.Client mock.request.hashid, mock.request.api_key
      mockFilter =
        price:
          from: 20
          to: 50

      # test filter with array value
      client.addFilter "foo", ["bar"]
      client.filters.should.have.keys "foo"
      client.filters.foo.should.have.length 1
      client.filters.foo[0].should.equal "bar"
      querystring = client.makeQueryString()
      querystring.should.be.equal 'hashid=ffffffffffffffffffffffffffffffff&filter%5Bfoo%5D=bar'

      # Add the same filter again must override last filter
      client.addFilter "foo", ["beer"]
      client.filters.should.have.keys "foo"
      client.filters.foo.should.have.length 1
      client.filters.foo[0].should.equal "beer"
      querystring = client.makeQueryString()
      querystring.should.be.equal 'hashid=ffffffffffffffffffffffffffffffff&filter%5Bfoo%5D=beer'

      # test filter with object value
      delete client.filters['foo']
      client.filters.should.be.empty
      client.addFilter 'price', mockFilter.price
      querystring = client.makeQueryString()
      client.filters.should.have.keys "price"
      querystring.should.be.equal 'hashid=ffffffffffffffffffffffffffffffff&filter%5Bprice%5D%5Bfrom%5D=20&filter%5Bprice%5D%5Bto%5D=50'

      # test filter with object value and array value
      client.addFilter 'foo', ['bar']
      client.filters.should.have.all.keys "foo", "price"
      client.filters.foo.should.have.length 1
      querystring = client.makeQueryString()
      querystring.should.be.equal 'hashid=ffffffffffffffffffffffffffffffff&filter%5Bprice%5D%5Bfrom%5D=20&filter%5Bprice%5D%5Bto%5D=50&filter%5Bfoo%5D=bar'


    it 'addParam', ->
      # Client for product type
      client = new doofinder.Client mock.request.hashid, mock.request.api_key, 5, 'product'
      client.params.should.be.a 'object'
      client.params.should.be.empty

      # Adds a new type and a query
      client.addParam 'type', 'category'
      client.addParam 'query', 'testQuery'
      client.params.should.have.all.keys 'type', 'query'
      querystring = client.makeQueryString()
      querystring.should.be.equal 'hashid=ffffffffffffffffffffffffffffffff&type=product&type=category&query=testQuery'

      # Override the existent query param
      client.addParam 'query', 'testQuery2'
      client.params.query.should.be.equal 'testQuery2'
      querystring = client.makeQueryString()
      querystring.should.be.equal 'hashid=ffffffffffffffffffffffffffffffff&type=product&type=category&query=testQuery2'

      # Delete the query param, and delete the type param (category)
      delete client.params['query']
      client.params.should.have.all.keys 'type'
      delete client.params['type']
      client.params.should.be.empty
      querystring = client.makeQueryString()
      querystring.should.be.equal 'hashid=ffffffffffffffffffffffffffffffff&type=product'

      # Same param multiple times is not allowed, a re-instantiation must override last assignement
      client.addParam 'type', 'categoryA'
      client.addParam 'type', 'categoryB'
      querystring = client.makeQueryString()
      querystring.should.be.equal 'hashid=ffffffffffffffffffffffffffffffff&type=product&type=categoryB'
