###
# js-doofinder tests
# author: @ecoslado
# 2015 04 01
###

assert = require "assert"
should = require('chai').should()
expect = require('chai').expect
doofinder = require "../lib/doofinder.js"
nock = require('nock')

mock =
  request:
    hashid: "ffffffffffffffffffffffffffffffff"
    api_key: "eu1-384fd8a73c7ff0859a5891f9f4083b1b9727f9c3"
  query: "iphone"
  sort:
    Object:
      price: "asc"
      title: "desc"
      description: "asc"
    Array: [("title": "asc"), ("description": "desc")]
    String: "price"
  params:
    valid:
      rpp: 30
      page: 4
    null:
      rpp: null
  filters:
    color: ['blue', 'red']
    price:
      gte: 4.36
      lt: 99

# Test doofinder
describe 'doofinder client', ->

  # Tests the client's stuff
  context 'makeQueryString can ', ->

    it 'handle several types', ->
      # Client for two types by constructor (made make multiple type params)
      client = new doofinder.Client mock.request.hashid, mock.request.api_key, 5, ['product', 'category']
      querystring = client.makeQueryString()
      querystring.should.be.equal 'hashid=ffffffffffffffffffffffffffffffff&type=product&type=category'


    it 'add filters', ->
      client = new doofinder.Client mock.request.hashid, mock.request.api_key
      mockFilter =
        price:
          from: 20
          to: 50
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

    it 'add params', ->
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
      delete client.params['type']
      querystring = client.makeQueryString()
      querystring.should.be.equal 'hashid=ffffffffffffffffffffffffffffffff&type=product'

      # Same param multiple times is not allowed, a re-instantiation must override last assignement
      client.addParam 'type', 'categoryA'
      client.addParam 'type', 'categoryB'
      querystring = client.makeQueryString()
      querystring.should.be.equal 'hashid=ffffffffffffffffffffffffffffffff&type=product&type=categoryB'

    it 'handle sort param in different formats', ->
      # Test for setSort. Can be setted object, array and string types.
      client = new doofinder.Client mock.request.hashid, mock.request.api_key

      # Test sort with array type
      # sort: [{price: 'asc'}, {brand: 'desc'}] -> sort[0][price]=asc&sort[1][brand]=desc
      client.setSort(mock.sort.Array)
      querystring = client.makeQueryString()
      querystring.should.be.equal 'hashid=ffffffffffffffffffffffffffffffff&sort%5B0%5D%5Btitle%5D=asc&sort%5B1%5D%5Bdescription%5D=desc'

      # Test sort with object type
      # sort: {price: 'asc'} -> sort[price]=asc
      client.setSort(mock.sort.Object)
      querystring = client.makeQueryString()
      querystring.should.be.equal 'hashid=ffffffffffffffffffffffffffffffff&sort%5Bprice%5D=asc&sort%5Btitle%5D=desc&sort%5Bdescription%5D=asc'

      # Test with string type
      # sort: price -> sort=price
      client.setSort(mock.sort.String)
      querystring = client.makeQueryString()
      querystring.should.be.equal 'hashid=ffffffffffffffffffffffffffffffff&sort=price'

  context 'sanitizeQuery can ', ->

    before () ->
      @client = new doofinder.Client mock.request.hashid, mock.request.api_key

    it 'checks valid queries', ->
      client = @client
      sanitized = client._sanitizeQuery "hello world", (query) -> return query
      sanitized.should.be.equal "hello world"
      #  54 characters word
      query = "123456789012345678901234567890123456789012345678901234"
      sanitized = client._sanitizeQuery query, (query) -> return query
      sanitized.should.be.equal query
      #  55 characters word
      query = "1234567890123456789012345678901234567890123456789012345"
      sanitized = client._sanitizeQuery query, (query) -> return query
      sanitized.should.be.equal query
      # checks five words, total 255 characters (whites included)
      chunk = "12345678901234567890123456789012345678901234567890"
      query1 = query2 = query3 = query4 = query5 = chunk
      query5 += '1'
      query = query1 + ' ' + query2 + ' ' + query3 + ' ' + query4 + ' ' + query5
      sanitized = client._sanitizeQuery query, (query) -> return query
      sanitized.should.be.equal query

    it 'forbids too long queries', ->
      client = @client
      query1 = query2 = query3 = query4 = "1234567890"
      # checks five words, query less than 255 characters (whites included), with one invalid word
      query5 = "12345678901234567890123456789012345678901234567890123456"
      query = query1 + ' ' + query2 + ' ' + query3 + ' ' + query4 + ' ' + query5
      foo = () -> client._sanitizeQuery(query, null)
      expect(foo).to.throw 'Maximum word length exceeded: 55.'

      # checks five words, total 256 characters (whites included)
      chunk = "12345678901234567890123456789012345678901234567890"
      query1 = query2 = query3 = query4 = query5 = chunk
      query5 += '12'
      query = query1 + ' ' + query2 + ' ' + query3 + ' ' + query4 + ' ' + query5
      foo = () -> client._sanitizeQuery(query, null)
      expect(foo).to.throw 'Maximum query length exceeded: 255.'



    context 'search', ->

      before () ->
        scope = nock('http://fooserver')
        .persist()
        .get('/5/search')
        .query(true)
        .reply((uri, requestBody)->
          querypart = uri.split('?')[1]
          { path: uri, headers: this.req.headers, parameters:querypart.split('&') }
        )

      after () ->
        nock.cleanAll

      it 'search with no type', (done) ->

        client = new doofinder.Client mock.request.hashid, mock.request.api_key, 5, null, 'fooserver'
        client.search '', (err, res) ->
          res.parameters.should.contain 'query=', 'page=1', 'rpp=10'
          res.parameters.should.have.length 4
          done()

      it 'search with type', (done) ->
        client = new doofinder.Client mock.request.hashid, mock.request.api_key, 5, 'product', 'fooserver'
        client.search '', (err, res) ->
          res.parameters.should.contain 'query=', 'type=product'
          done()

      it 'search with multi-type', (done) ->
        client = new doofinder.Client mock.request.hashid, mock.request.api_key, 5, ['product', 'category'], 'fooserver'
        client.search '', (err, res) ->
          res.parameters.should.contain 'type=category', 'type=product'
          done()

      # SORT PARAMS
      it 'search with type and query', (done) ->
        client = new doofinder.Client mock.request.hashid, mock.request.api_key, 5, 'product', 'fooserver'
        client.search 'querystring', (err, res) ->
          res.parameters.should.contain 'query=querystring', 'type=product'
          done()

      it 'search with type query and params (sort type object of: object, array, string)', (done) ->
        client = new doofinder.Client mock.request.hashid, mock.request.api_key, 5, 'product', 'fooserver'
        client.search 'querystring', {sort: mock.sort.Object}, (err, res) ->
          res.parameters.should.contain 'query=querystring', 'sort%5Bprice%5D=asc', 'sort%5Btitle%5D=desc', 'sort%5Bdescription%5D=asc', 'type=product'
          done()

      it 'search with type query and params (sort type array of: object, array, string)', (done) ->
        client = new doofinder.Client mock.request.hashid, mock.request.api_key, 5, 'product', 'fooserver'
        client.search 'querystring', {sort: mock.sort.Array}, (err, res) ->
          res.parameters.should.contain 'type=product', 'query=querystring', 'sort%5B0%5D%5Btitle%5D=asc', 'sort%5B1%5D%5Bdescription%5D=desc'
          done()

      it 'search with type query and params (sort type string of: object, array, string)', (done) ->
        client = new doofinder.Client mock.request.hashid, mock.request.api_key, 5, 'product', 'fooserver'
        client.search 'querystring', {sort: mock.sort.String}, (err, res) ->
          res.parameters.should.contain 'sort=price', 'query=querystring', 'type=product'
          done()

      # SINGLE PARAMS
      it 'search with type query and params (param valid of: valid, null)', (done) ->
        client = new doofinder.Client mock.request.hashid, mock.request.api_key, 5, 'product', 'fooserver'
        client.search 'querystring', mock.params.valid, (err, res) ->
          res.parameters.should.contain 'query=querystring', 'rpp=30', 'page=4', 'type=product'
          done()

      it 'search with type query and params (param null of: valid, null)', (done) ->
        client = new doofinder.Client mock.request.hashid, mock.request.api_key, 5, 'product', 'fooserver'
        client.search 'querystring', mock.params.null, (err, res) ->
          res.parameters.should.contain 'type=product', 'query=querystring'
          done()

      it 'search with type query and params and one sort of type string', (done) ->
        client = new doofinder.Client mock.request.hashid, mock.request.api_key, 5, 'product', 'fooserver'
        client.search 'querystring', {rpp: mock.params.valid.rpp, page: mock.params.valid.page, sort: mock.sort.String}, (err, res) ->
          res.parameters.should.contain 'type=product', 'page=4', 'rpp=30', 'sort=price', 'query=querystring'
          done()

      # FILTER PARAMS
      it 'search with type query and filters', (done) ->
        client = new doofinder.Client mock.request.hashid, mock.request.api_key, 5, 'product', 'fooserver'
        client.search 'querystring', {filters: mock.filters}, (err, res) ->
          res.parameters.should.contain 'query=querystring', 'filter%5Bcolor%5D=blue', 'filter%5Bcolor%5D=red', 'filter%5Bprice%5D%5Bgte%5D=4.36', 'filter%5Bprice%5D%5Blt%5D=99'
          done()

    describe 'hit', ->

      it 'basic hit with query', (done) ->
        response =
          field: "value"
        scope = nock('http://fooserver')
        .filteringPath(/random=[^&]*/g, 'random=XXX')
        .get('/5/hit/ffffffffffffffffffffffffffffffff/666/querystring?random=XXX')
        .reply(200, response)

        client = new doofinder.Client mock.request.hashid, mock.request.api_key, 5, 'product', 'fooserver'
        client.hit 666, 'querystring', (err, res) ->
          res.should.to.be.deep.equal response
          done()

    describe 'options', ->

      it 'options', (done) ->
        response =
          field: "value"
        scope = nock('http://fooserver')
          .get('/5/options/ffffffffffffffffffffffffffffffff')
          .reply(200, response)
        client = new doofinder.Client mock.request.hashid, mock.request.api_key, 5, 'product', 'fooserver'
        client.options (err, res) ->
          res.should.to.be.deep.equal response
          done()
