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
        query.should.be.equal 'silla'
        params.should.have.keys 'query_counter', 'query', 'filters', 'page'
        done()

      controller = new doofinder.Controller client_mock, [widget_mock]
      controller.search 'silla'

    ### IN DOC STATES THAT 'EVERY SEARCH PARAM' CAN BE USED IN SEARCH METHOD
      # 'filters' are search params, but are not allowe
      # either fix the doc or fix the source code
    it 'extra search params can be added in search', (done)->
      client_mock.search = (query, params, cb)->
        params.should.have.keys 'query_counter', 'query', 'filters', 'page', 'rpp'
        params.rpp.should.be.equal 23
        params.filters.color.should.eql ['Rojo']
        done()
      controller = new doofinder.Controller client_mock, [widget_mock]
      controller.search 'silla', rpp: 23, filters: color: ['Rojo']
    ###

    it 'extra search params can be added in constructor', (done)->
      client_mock.search = (query, params)->
        params.should.have.keys 'query_counter', 'query', 'filters', 'page', 'rpp'
        params.rpp.should.be.equal 11
        params.filters.color.should.eql ['Azul']
        done()
      controller = new doofinder.Controller client_mock, [widget_mock], {rpp: 11, filters: {color: ['Azul']}}
      controller.search 'silla'

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
