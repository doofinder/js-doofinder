###
# js-doofinder tests
# author: @ecoslado
# 2015 04 01
###

assert = require "assert"
should = require('chai').should()
expect = require('chai').expect
doofinder = require "../lib/doofinder.js"
request = require('request')
fake = require('fake-api-server');

startServer =  ->
  # Server configuration
  searchs = new fake.Resource("search")
  .add({
    name: "Marte Rojo",
    author: "Kim Stanley Robinson"
    })
  .add({
    name: "Fahrenheit 451",
    author: "Ray Bradbury"
  })
  server = new fake.Server().register(searchs).listen(3000)


mock =
  request:
    hashid: "ffffffffffffffffffffffffffffffff"
  api_key: "eu1-384fd8a73c7ff0859a5891f9f4083b1b9727f9c3"
  query: "iphone"

# Test doofinder
describe 'doofinder', ->

  # Tests the client's stuff
  describe 'client', ->
    before(startServer)

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

    it 'setSort', ->
      # Test for setSort. Can be setted object, array and string types.
      client = new doofinder.Client mock.request.hashid, mock.request.api_key
      mockSort =
        Object:
          price: "asc"
          title: "desc"
          description: "asc"
        Array: [("title": "asc"), ("description": "desc")]
        String: "price"

      # Test sort with array type
      # sort: [{price: 'asc'}, {brand: 'desc'}] -> sort[0][price]=asc&sort[1][brand]=desc
      client.setSort(mockSort.Array)
      querystring = client.makeQueryString()
      querystring.should.be.equal 'hashid=ffffffffffffffffffffffffffffffff&sort%5B0%5D%5Btitle%5D=asc&sort%5B1%5D%5Bdescription%5D=desc'

      # Test sort with object type
      # sort: {price: 'asc'} -> sort[price]=asc
      client.setSort(mockSort.Object)
      querystring = client.makeQueryString()
      querystring.should.be.equal 'hashid=ffffffffffffffffffffffffffffffff&sort%5Bprice%5D=asc&sort%5Btitle%5D=desc&sort%5Bdescription%5D=asc'

      # Test with string type
      # sort: price -> sort=price
      client.setSort(mockSort.String)
      querystring = client.makeQueryString()
      querystring.should.be.equal 'hashid=ffffffffffffffffffffffffffffffff&sort=price'

    it 'sanitizeQuery', ->
      # checks if words are longer than 55 chars and the whole query is longer than 255 chars
      client = new doofinder.Client mock.request.hashid, mock.request.api_keys
      # checks valid query
      query = "hello world"
      sanitized = client._sanitizeQuery query, (query) -> return query
      sanitized.should.be.equal query
      # checks 54 characters word
      query = "123456789012345678901234567890123456789012345678901234"
      sanitized = client._sanitizeQuery query, (query) -> return query
      sanitized.should.be.equal query
      # checks 55 characters word
      query = "1234567890123456789012345678901234567890123456789012345"
      sanitized = client._sanitizeQuery query, (query) -> return query
      sanitized.should.be.equal query
      # checks 56 characters word
      query = "12345678901234567890123456789012345678901234567890123456"
      foo = () -> client._sanitizeQuery(query, null)
      expect(foo).to.throw 'Maximum word length exceeded: 55.'
      # checks five words, total 254 characters (whites included)
      query1 = query2 = query3 = query4 = query5 = "12345678901234567890123456789012345678901234567890"
      query = query1 + ' ' + query2 + ' ' + query3 + ' ' + query4 + ' ' + query5
      sanitized = client._sanitizeQuery query, (query) -> return query
      sanitized.should.be.equal query
      # checks five words, total 255 characters (whites included)
      query5 = "123456789012345678901234567890123456789012345678901"
      query = query1 + ' ' + query2 + ' ' + query3 + ' ' + query4 + ' ' + query5
      sanitized = client._sanitizeQuery query, (query) -> return query
      sanitized.should.be.equal query
      # checks five words, total 256 characters (whites included)
      query5 = "1234567890123456789012345678901234567890123456789012"
      query = query1 + ' ' + query2 + ' ' + query3 + ' ' + query4 + ' ' + query5
      foo = () -> client._sanitizeQuery(query, null)
      expect(foo).to.throw 'Maximum query length exceeded: 255.'
      # checks five words, query less than 255 characters (whites included), with one invalid word
      query1 = query2 = query3 = query4 = query5 = "1234567890"
      query5 = "12345678901234567890123456789012345678901234567890123456"
      query = query1 + ' ' + query2 + ' ' + query3 + ' ' + query4 + ' ' + query5
      foo = () -> client._sanitizeQuery(query, null)
      expect(foo).to.throw 'Maximum word length exceeded: 55.'

    it 'hit', ->
      a = 1

    it 'search', ->
      request.get "http://localhost:3000/api/searchs", (err, res, body) ->
        body.should.be.equal "slkdjflksdjf"

    it 'options', ->
      a = 1

    it '__processResponse', ->
      a = 1
