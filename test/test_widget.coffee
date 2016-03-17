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
      range:
        buckets: [
          key: "0.0-*"
          stats:
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
      missing: 
        doc_count: 16
      doc_count: 10
      other: 0
      terms: 
        buckets: [
          key: "Azul"
          doc_count: 3
        ,
          key: "Rojo"
          doc_count: 1
        ]
      total: 
        value: 1

    categories:
      _type: "terms"
      missing: 
        doc_count: 0
      doc_count: 50
      other: 0
      terms: 
        buckets: [
          key: "Sillas de paseo"
          doc_count: 6
        ,
          key: "Seguridad en el hogar"
          doc_count: 5
        ]
      total:
        value: 50


# Test doofinder
describe 'doofinder widgets: ', ->

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

  context 'any widget ' , ->

    it 'can bind and trigger', (done) ->
      widget = new doofinder.Widget '#query'
      widget.bind 'test_event', (eventType, params) ->
        params.should.be.deep.equal {testKey: 'testValue'}
        done()

      widget.trigger 'test_event', {testKey: 'testValue'}


  context 'the queryInput widget', ->

    beforeEach () ->
      $ = doofinder.jQuery
      # reset the query input, to get rid of callbacks
      $('body').empty().append('<input type="text" id="query"></input>')
      @queryInput = $('#query')
      @client = new doofinder.Client mock.request.hashid, mock.request.api_key

    it 'triggers a search on third character', (done) ->
      queryInputWidget = new doofinder.widgets.QueryInput '#query'
      controller = new doofinder.Controller @client
      controller.addWidget queryInputWidget
      searchCalled = false
      controller.search = (query) ->
        searchCalled = true
        query.length.should.be.equal 3
        done()

      # two characters, nothing happens
      @queryInput.val 'ch'
      @queryInput.trigger 'keydown'
      searchCalled.should.be.false
      # three characters, search is triggered
      @queryInput.val 'cha'
      @queryInput.trigger 'keydown'

    it 'customize # of characters needed to trigger search', (done) ->
      queryInputWidget = new doofinder.widgets.QueryInput '#query', captureLength: 4
      controller = new doofinder.Controller @client
      controller.addWidget queryInputWidget
      searchCalled = false
      controller.search = (query) ->
        searchCalled = true
        query.length.should.be.equal 4
        done()
      # 3 characters, nothing happens
      @queryInput.val 'cha'
      @queryInput.trigger 'keydown'
      searchCalled.should.be.false
      # 4 characters, search is triggered
      @queryInput.val 'chai'
      @queryInput.trigger 'keydown'

  context 'the results widget', ->

    beforeEach () ->
      scope = nock('http://fooserver')
        .get('/5/search')
        .query(true)
        .reply((uri, requestBody)->
          query_counter = /query_counter=(\d+)/.exec(uri)[1]
          fake_results.query_counter = parseInt query_counter
          fake_results
        )
      @$ = doofinder.jQuery
      # reset the query input, to get rid of callbacks
      @$('body').empty().append('<input type="text" id="query"></input><div id="results"></div>')
      # set up doofinder controller
      client = new doofinder.Client mock.request.hashid, mock.request.api_key,5,null,'fooserver'
      queryInputWidget = new doofinder.widgets.QueryInput '#query'
      @resultsWidget = new doofinder.widgets.Results '#results'
      @controller = new doofinder.Controller client, [queryInputWidget]
      # the els in questionr
      @resultsContainer = @$ '#results'
      @queryEl = @$ '#query'

    it 'display search results and triggers df:rendered', (done) ->
      resultsContainer = @resultsContainer
      @controller.addWidget @resultsWidget
      # DOM event comes first
      resultsContainer.one 'DOMSubtreeModified', () ->
        resultsContainer.find('li').length.should.be.equal 2
        resultsContainer.find('li b')[0].innerHTML.should.contain "Aironet"
      # df:rendered event comes second
      @resultsWidget.bind 'df:rendered', (event, res) ->
        res.results.length.should.be.equal 2
        done()
      @queryEl.val 'xill'
      @queryEl.trigger 'keydown' # search!

    it 'replaces search results', (done) ->
      # set up a second virtal response on the queue
      scope = nock('http://fooserver')
        .get('/5/search')
        .query(true)
        .reply((uri, requestBody)->
          query_counter = /query_counter=(\d+)/.exec(uri)[1]
          fake_results.query_counter = parseInt query_counter
          # remove last result
          dup_results = JSON.parse JSON.stringify fake_results
          dup_results.results.pop
          dup_results
        )
      resultsContainer = @resultsContainer
      queryEl = @queryEl
      @controller.addWidget @resultsWidget
      self = this
      resultsContainer.one 'DOMSubtreeModified', () ->
        resultsContainer.find('li').length.should.be.equal 2
        # after first search, get second page. previous content gets overwritten
        self.controller.nextPage()
        resultsContainer.one 'DOMSubtreeModified', () ->
          resultsContainer.find('li').length.should.be.equal 1
        done()
      # search and start the whole thing
      queryEl.val 'sill'
      queryEl.trigger 'keydown'

    it 'accepts custom templates, vars and functions', (done) ->
      # we add another results widget with alternate template
      @$('body').append('<div id="alt_results"></div>')
      template = '<ul>{{#results}}' +
        '            <li class="{{class_name}}">' +
        '               {{#bold}}{{title}}{{/bold}}:{{description}}<br></li>' +
        '            {{/results}}' +
        '         </ul>'
      altResultsWidget = new doofinder.widgets.Results '#alt_results',
        template: template,
        templateVars:
          class_name: 'custom_template'
        templateFunctions:
          bold: () ->
            (text, render) ->
              '<b class="custom">' + render(text) + '</b>'

      @controller.addWidget altResultsWidget
      self = this
      @$('#alt_results').on 'DOMNodeInserted', () ->
        self.$('#alt_results').find('li.custom_template').length.should.be.equal 2
        self.$('#alt_results').find('li b.custom').length.should.be.equal 2
        done()

      @queryEl.val 'zill'
      @queryEl.trigger 'keydown'

  context 'the scroll results widget', ->

    beforeEach () ->
      scope = nock('http://fooserver')
        .get('/5/search')
        .query(true)
        .reply((uri, requestBody)->
          query_counter = /query_counter=(\d+)/.exec(uri)[1]
          fake_results.query_counter = parseInt query_counter
          fake_results
        )
      @$ = doofinder.jQuery
      # reset the query input, to get rid of callbacks
      @$('body').empty().append('<input type="text" id="query"></input><div id="scroll"></div>')
      # set up doofinder controller
      client = new doofinder.Client mock.request.hashid, mock.request.api_key,5,null,'fooserver'
      queryInputWidget = new doofinder.widgets.QueryInput '#query'
      @scrollWidget = new doofinder.widgets.ScrollResults '#scroll', scrollOffset: 95
      @controller = new doofinder.Controller client, [queryInputWidget]
      # the els in questionr
      @scrollContainer = @$ '#scroll'
      @queryEl = @$ '#query'

    it 'display search results and triggers df:rendered', (done) ->
      scrollContainer = @scrollContainer
      @controller.addWidget @scrollWidget
      # DOM event comes first
      scrollContainer.one 'DOMSubtreeModified', () ->
        scrollContainer.find('li').length.should.be.equal 2
        scrollContainer.find('li b')[0].innerHTML.should.contain "Aironet"
      # df:rendered event comes second
      @scrollWidget.bind 'df:rendered', (event, res) ->
        res.results.length.should.be.equal 2
        done()
      @queryEl.val 'xill'
      @queryEl.trigger 'keydown' # search!

    it 'appends second page search results', (done) ->
      # set up a second virtal response on the queue
      scope = nock('http://fooserver')
        .get('/5/search')
        .query(true)
        .reply((uri, requestBody)->
          query_counter = /query_counter=(\d+)/.exec(uri)[1]
          fake_results.query_counter = parseInt query_counter
          # remove last result
          dup_results = JSON.parse JSON.stringify fake_results
          dup_results.results.pop()
          dup_results
        )
      scrollContainer = @scrollContainer
      @controller.addWidget @scrollWidget
      queryEl = @queryEl
      self = this

      scrollContainer.one 'DOMSubtreeModified', () -> # first nsearch
        scrollContainer.find('li').length.should.be.equal 2
        # after first search, get second page. previous content gets overwritten
        scrollContainer.one 'DOMSubtreeModified', () ->
          # now it's three (new results are appended)
          scrollContainer.find('li').length.should.be.equal 3
          done()
        self.controller.nextPage()

      # search and start the whole thing
      queryEl.val 'sill'
      queryEl.trigger 'keydown'

    it ' calls nextPage when df:scroll is triggered with custom offset', (done)->
      scrollContainer = @scrollContainer
      scrollContainer.css position: 'relative', height: '800px', overflow: 'auto'
      content = scrollContainer.find('div').first()
      content.css height: '1200px'
      controller = @controller
      controller.addWidget @scrollWidget
      queryEl = @queryEl
      self = this
      _nextPage = controller.nextPage
      nextPageCalled = false

      controller.nextPage = () ->
        nextPageCalled = true
        controller.nextPage = _nextPage
        done()

      scrollContainer.one 'df:scroll', ()->
        # df:scroll is after nextPage, if it happened
        # no nextPage called
        nextPageCalled.should.be.false
        # now we move the scroll to the "nextPage" limit
        scrollContainer.scrollTop 305
        # and trigger df:scroll again. this time, nextPage should be called
        scrollContainer.trigger 'df:scroll'

      # set scrollbar one pixel below the limit
      scrollContainer.scrollTop 304
      # and trigger the event
      scrollContainer.trigger 'df:scroll'


      scrollContainer.on 'DOMSubtreeModified', ()->
        # scroll is on top, no nextPage should be called after this
        scrollContainer.trigger 'df:scroll'

      # start the process
      queryEl.val 'zill'
      queryEl.trigger 'keydown'

  context ' termfacet widget ' , ->

    beforeEach () ->
      scope = nock('http://fooserver')
      .get('/5/search')
      .query(true)
      .reply((uri, requestBody)->
        query_counter = /query_counter=(\d+)/.exec(uri)[1]
        fake_results.query_counter = parseInt query_counter
        fake_results)

      @$ = doofinder.jQuery
      # reset html
      @$('body').empty().append '<input type="text" id="query"></input><div id="fcontainer"></div><div id="results"></div>'
      @queryEl = @$ '#query'
      client = new doofinder.Client mock.request.hashid, mock.request.api_key,5,null,'fooserver'
      queryInputWidget = new doofinder.widgets.QueryInput '#query'
      @controller = new doofinder.Controller client, [queryInputWidget]

    it 'display all facet terms returned in the response', (done) ->
      termFacetWidget = new doofinder.widgets.TermFacet '#fcontainer', 'color'
      @controller.addWidget termFacetWidget
      facetContainer = @$ '#fcontainer'

      facetContainer.on 'DOMNodeInserted', ()->
        # two color terms
        facetContainer.find('a.df-facet').length.should.be.equal 2
        done()

      @queryEl.val 'pill'
      @queryEl.trigger 'keydown'

    it 'triggers the df:rendered event' , (done)->
      termFacetWidget = new doofinder.widgets.TermFacet '#fcontainer', 'color'
      @controller.addWidget termFacetWidget
      facetContainer = @$ '#fcontainer'

      termFacetWidget.bind 'df:rendered', (event, results) ->
        results.results.length.should.be.equal 2
        done()

      @queryEl.val 'lill'
      @queryEl.trigger 'keydown'

    it 'add filter on click', (done) ->
      termFacetWidget = new doofinder.widgets.TermFacet '#fcontainer', 'color'
      @controller.addWidget termFacetWidget
      facetContainer = @$ '#fcontainer'
      self = this
      facetContainer.one 'DOMNodeInserted', ()->
        # filter should be empty
        self.controller.status.params.filters.should.be.empty

        # get ready for next search.
        _refresh  = self.controller.refresh
        self.controller.refresh = () ->
          # filter should be added
          self.controller.status.params.filters.should.have.keys 'color'
          self.controller.status.params.filters.color.should.be.an.Array
          self.controller.status.params.filters.color.should.eql ['Azul']
          # and we're done
          self.controller.refresh = _refresh
          done()

        # now we click on a facet
        facetContainer.find('a[data-facet="color"][data-value="Azul"]').trigger 'click'

      @queryEl.val 'lill'
      @queryEl.trigger 'keydown'

    it 'remove filter on click', (done) ->
      # setup second server response -- with filter info
      scope = nock('http://fooserver')
      .get('/5/search')
      .query(true)
      .reply((uri, requestBody)->
        query_counter = /query_counter=(\d+)/.exec(uri)[1]
        fake_results.query_counter = parseInt query_counter
        dup_results = JSON.parse JSON.stringify fake_results
        dup_results.filter = terms: color: ['Azul']
        dup_results)
      # setup widgets and stuff
      termFacetWidget = new doofinder.widgets.TermFacet '#fcontainer', 'color'
      @controller.addWidget termFacetWidget
      facetContainer = @$ '#fcontainer'
      self = this
      ## get ready for first response
      facetContainer.one 'DOMNodeInserted', ()->
        # filter should be empty
        self.controller.status.params.filters.should.be.empty
        ## get ready for first refresh (with a filter)
        facetContainer.one 'DOMNodeInserted', ()->
          # filter should be present
          self.controller.status.params.filters.should.have.keys 'color'
          # get ready for second refresh (without a filter)
          _refresh  = self.controller.refresh
          self.controller.refresh = () ->
            # filter should be empty
            self.controller.status.params.filters.color.should.be.empty
            self.controller.refresh = _refresh
            done()
          # after second (filtered) response, click on a selected term -- remove filter
          facetContainer.find('a[data-facet="color"][data-value="Azul"]').trigger 'click'

        # after first (unfiltered) response, click on a facet. add filter
        facetContainer.find('a[data-facet="color"][data-value="Azul"]').trigger 'click'

      @queryEl.val 'lill'
      # ask for the first response
      @queryEl.trigger 'keydown'

    it 'renders custom templates', (done) ->
      template = '<div class="df-facets custom {{customVar}}">'+
            '<a href="#" class="df-panel__title" data-toggle="panel">{{label}}</a>'+
            '<div class="df-facets__content">'+
            '<ul>'+
            '{{#terms.length}}'+
            '<li>'+
            '<a href="#" class="df-facet {{#selected}}df-facet--active{{/selected}}" data-facet="{{name}}"'+
            'data-value="{{ key }}">{{ key }} <span'+
            'class="df-facet__count">{{ doc_count }}</span></a>'+
            '</li>'+
            '{{/terms.length}}'
      # setup widgets and stuff
      termFacetWidget = new doofinder.widgets.TermFacet '#fcontainer', 'color', template: template, templateVars: customVar: 'customValue'
      @controller.addWidget termFacetWidget
      facetContainer = @$ '#fcontainer'

      facetContainer.one 'DOMNodeInserted', ()->
        # custom template should be rendered
        facetContainer.find('div.custom').length.should.eql 1
        # with custom vars
        facetContainer.find('div.customValue').length.should.eql 1
        done()

      @queryEl.val 'xixx'
      @queryEl.trigger 'keydown'

  context 'rangefacet widget ', ->

    beforeEach () ->
      scope = nock('http://fooserver')
      .get('/5/search')
      .query(true)
      .reply((uri, requestBody)->
        query_counter = /query_counter=(\d+)/.exec(uri)[1]
        fake_results.query_counter = parseInt query_counter
        fake_results)

      @$ = doofinder.jQuery
      # reset html
      @$('body').empty().append '<input type="text" id="query"></input><div id="fcontainer"></div><div id="results"></div>'
      @queryEl = @$ '#query'
      client = new doofinder.Client mock.request.hashid, mock.request.api_key,5,null,'fooserver'
      queryInputWidget = new doofinder.widgets.QueryInput '#query'
      @controller = new doofinder.Controller client, [queryInputWidget]

    it 'display ranges returned in the response and triggers df:rendered', (done) ->
      rangeFacetWidget = new doofinder.widgets.RangeFacet '#fcontainer', 'best_price'
      @controller.addWidget rangeFacetWidget
      facetContainer = @$ '#fcontainer'
      counter = 0
      rangeFacetWidget.bind 'df:rendered', (res)->
        facetContainer.find('span.js-grid-text-0').first().text().should.be.eql '8'
        facetContainer.find('span.js-grid-text-1').first().text().should.be.eql '117'
        facetContainer.find('span.js-grid-text-2').first().text().should.be.eql '225'
        done()

      @queryEl.val 'pill'
      @queryEl.trigger 'keydown' ###
