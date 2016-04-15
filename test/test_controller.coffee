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
  query_counter: 1
  results_per_page: 12
  page: 1
  total: 31
  query: "some query"
  hashid: mock.request.hashid
  max_score: 1.3
  results: [
    description: "Antena. 5.2 dBi. omnidireccional…"
    dfid: "523093f0ded16148dc005362"
    title: "Cisco Aironet Pillar Mount Diversity Omnidirectional Antenna"
    url: "http://www.example.com/product_description.html"
    image_url: "http://www.example.com/images/product_image.jpg"
    type: "product"
    id: "ID1"
  ,
    description: "Teclado. USB. España…"
    dfid: "523093f0ded16148dc0053xx"
  ],
  query_name: "fuzzy"
  facets:
    best_price:
      _type: "range"
      ranges: [
        from: 0
        count: 24
        min: 8.5
        max: 225
        total_count: 24
        total: 1855.57
        mean: 77.32
      ]

    color:
      _type: "terms"
      missing: 16
      total: 10
      other: 0
      terms: [
        term: "Azul"
        count: 3
      ,
        term: "Rojo"
        count: 1
      ]

    categories:
      _type: "terms"
      missing: 0
      total: 50
      other: 0
      terms: [
        term: "Sillas de paseo"
        count: 6
      ,
        term: "Seguridad en el hogar"
        count: 5
      ]

client_mock =
  search: ()->
  hit: ()->
  hashid: mock.request.hashid

widget_mock =
  render: () ->
  renderNext: () ->
  init: () ->


# Test doofinder
describe 'doofinder controller: ', ->

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

  context 'search method ' , ->

    beforeEach ()->
      client_mock =
        search: ()->
        hit: ()->
        hashid: mock.request.hashid

    it 'df:search is triggered', (done) ->
      controller = new doofinder.Controller client_mock, [widget_mock]
      controller.bind 'df:search', (ev, params) ->
        params.should.have.keys 'query_counter', 'query', 'filters'
        done()
      controller.search 'silla'

    it 'basic search use right params', (done) ->
      client_mock.search = (query, params, cb) ->
        query.should.eql 'silla'
        params.should.have.keys 'query_counter', 'query', 'filters', 'page'
        done()

      controller = new doofinder.Controller client_mock, [widget_mock]
      controller.search 'silla'

    it 'extra search params can be added in search', (done)->
      client_mock.search = (query, params, cb)->
        params.should.have.keys 'query_counter', 'query', 'filters', 'page', 'rpp'
        params.rpp.should.eql 23
        params.filters.color.should.eql ['Rojo']
        done()
      controller = new doofinder.Controller client_mock, [widget_mock]
      controller.search 'silla', rpp: 23, filters: color: ['Rojo']


    it 'extra search params can be added in constructor', (done)->
      client_mock.search = (query, params)->
        params.should.have.keys 'query_counter', 'query', 'filters', 'page', 'rpp'
        params.rpp.should.eql 11
        params.filters.color.should.eql ['Azul']
        done()
      controller = new doofinder.Controller client_mock, [widget_mock], {rpp: 11, filters: {color: ['Azul']}}
      controller.search 'silla'

  context 'filters management', ->

    beforeEach ()->
      client_mock =
        search: ()->
        hit: ()->
        hashid: mock.request.hashid

    it 'when adding terms filters, filters params change', (done) ->
      # we need to make a search first in order to "refresh" it with
      # applied filters
      controller = new doofinder.Controller client_mock, [widget_mock]
      # make 1 search to refresh later
      controller.search 'silla'
      # prepare for refresh
      client_mock.search = (query, params, cb) ->
        params.filters.color.should.be.eql ['Azul', 'Rojo']
        params.filters.brand.should.be.eql ['Nike']
        done()

      controller.addFilter 'color', 'Azul'
      controller.addFilter 'brand', 'Nike'
      controller.addFilter 'color', 'Rojo'

      controller.refresh() # search wigh color: ['Azul', 'Rojo'] and brand: ['Nike']

    it 'when removing terms filters, filters params change', (done) ->
      controller = new doofinder.Controller client_mock, [widget_mock]
      # make 1 search to refresh later
      controller.search 'silla'
      # add some filters
      controller.addFilter 'color', 'Azul'
      controller.addFilter 'brand', 'Nike'
      controller.addFilter 'color', 'Rojo'
      # refresh. we're not testing anything yet
      controller.refresh()
      # now remove some
      controller.removeFilter 'color', 'Azul'
      controller.removeFilter 'brand', 'Nike'
      # those filters should be removed
      client_mock.search = (query, params, cb) ->
        params.filters.should.have.keys 'color', 'brand'
        params.filters.color.should.be.eql ['Rojo']
        params.filters.brand.should.be.empty
        done()
      # go!
      controller.refresh()

    it 'when adding range filters, filters params change', (done) ->
      controller = new doofinder.Controller client_mock, [widget_mock]
      controller.search 'silla'
      client_mock.search = (query, params, cb) ->
        params.filters.price.should.be.eql gt: 10
        done()
      controller.addFilter 'price', gt: 10
      controller.refresh()

    it 'when removing range filters, filters params change', (done) ->
      controller = new doofinder.Controller client_mock, [widget_mock]
      controller.search 'silla'
      controller.addFilter 'price', gt: 10
      controller.refresh()
      controller.removeFilter 'price', lte: 5
      client_mock.search = (query, params, cb) ->
        params.filters.should.be.empty
        done()
      controller.refresh()

  context ' pagination methods ', ->

    beforeEach ()->
      client_mock =
        search: ()->
        hit: ()->
        hashid: mock.request.hashid


    it 'nextPage redo the search with next page', (done) ->
      controller = new doofinder.Controller client_mock, [widget_mock]
      # when first search done, try nextPage
      controller.bind 'df:search', ()->
        client_mock.search = (query, params, cb) ->
          # same query
          params.query.should.eql 'silla'
          # increased page
          params.page.should.eql 2
          done()

        # next page!
        controller.nextPage()

      # first search
      controller.search 'silla'

    it 'getPage redo the search with any specified page', (done) ->
      controller = new doofinder.Controller client_mock, [widget_mock]
      # when first search done, try getPage
      controller.bind 'df:search', ()->
        client_mock.search = (query, params, cb) ->
          params.query.should.eql 'silla'
          params.page.should.eql 22
          done()

        # get page!
        controller.getPage 22

      # first search
      controller.search 'silla'


  context ' parameter setting methods ', ->

    beforeEach ()->
      client_mock =
        search: ()->
        hit: ()->
        hashid: mock.request.hashid


    it 'setSearchParam adds parameter to every search', (done) ->
      client_mock.search = (query, params) ->
        params.should.have.keys 'query_counter', 'query', 'filters', 'page', 'rpp', 'transformer'
        params.transformer.should.eql 'testTransformer'
        params.rpp.should.eql 23
        # when we search again, the search parameters  must remain
        client_mock.search = (query, params) ->
          params.should.have.keys 'query_counter', 'query', 'filters', 'page', 'rpp', 'transformer'
          params.transformer.should.eql 'testTransformer'
          params.rpp.should.eql 23
          done()
        # second search
        controller.search 'silla2'

      controller = new doofinder.Controller client_mock, [widget_mock]
      controller.setSearchParam 'rpp', 23
      controller.setSearchParam 'transformer', 'testTransformer'

      # first search
      controller.search 'silla'

    it 'addParam adds parameter to use in refresh', (done)->
      controller = new doofinder.Controller client_mock, [widget_mock]
      # when first search done, add params and refresh
      controller.bind 'df:search', ()->
        # add new param
        controller.addParam 'transformer', 'testTransformer'
        # modify param
        controller.addParam 'rpp', 32
        # prepare for refreshing
        client_mock.search = (query, params, cb) ->
          # same query
          params.query.should.eql 'silla'
          # new params
          params.should.have.keys 'query_counter', 'query', 'filters', 'page', 'rpp', 'transformer'
          params.transformer.should.eql 'testTransformer'
          params.rpp.should.eql 32
          done()
        # refresh!
        controller.refresh()
      # initial search
      controller.search 'silla'

  context ' refresh methods ', ->

    beforeEach ()->
      client_mock =
        search: ()->
        hit: ()->
        hashid: mock.request.hashid

    it ' triggers refresh signal and actually do the search', (done) ->
      controller = new doofinder.Controller client_mock, [widget_mock]
      controller.search 'silla', rpp: 33, filters: color: ['Rojo']

      controller.bind 'df:refresh', (event, params)->
        params.query_counter.should.eql 2

      client_mock.search = (query, params, cb) ->
        query.should.eql 'silla'
        params.should.have.keys 'rpp', 'filters', 'query', 'query_counter', 'page'
        params.query_counter.should.eql 3
        params.filters.should.eql color: ['Rojo']
        params.rpp.should.eql 33
        done()

      controller.refresh()

  context ' addWidget method ', ->

    beforeEach ()->
      client_mock =
        search: ()->
        hit: ()->
        hashid: mock.request.hashid

    it ' should call the widget "init" upon adding', (done) ->
      widget_mock.init = ()->
        true.should.be.true
        done()
      controller = new doofinder.Controller client_mock
      controller.addWidget widget_mock

    it ' should increase the internal widgets list', (done) ->
      widget_mock.init = ()->
      controller = new doofinder.Controller client_mock, [widget_mock]
      controller.widgets.should.have.length 1
      controller.addWidget widget_mock
      controller.widgets.should.have.length 2
      done()

  context ' bind method can ', ->

    beforeEach ()->
      client_mock =
        search: ()->
        hit: ()->
        hashid: mock.request.hashid

    it ' bind events to callbacks (duhhh)', (done) ->
      res_mock = { results: [1,2,3,4,5,6,7,8,9,10,11], query_name: 'test', query_coounter: 2 }
      controller = new doofinder.Controller client_mock, [widget_mock]
      client_mock.search = (query, params, cb)->
        cb null, res_mock
      events_count = 0
      # bind to df:results_received
      controller.bind 'df:results_received', (e, res) ->
        events_count++
        res.query_name.should.eql 'test'
        res.results.should.have.length 11

      # bind to df:search
      controller.bind 'df:search', (e, params) ->
        events_count++
        params.query_counter.should.be.eql 2

      # bind to df:next_page
      controller.bind 'df:next_page', (e) ->
        events_count.should.be.eql 2
        events_count++ # three events triggered, counting this one

      # bind to df:getPage
      controller.bind 'df:get_page', (e) ->
        events_count.should.be.eql 3
        done()

      controller.search 'silla' # to tests df:search and df:results_received

      # before getPage and nextPage bindings, turn off searching to not repeat tests
      client_mock.search = () ->

      controller.nextPage() # to test df:next_page
      controller.getPage 3  # to test df:get_page
