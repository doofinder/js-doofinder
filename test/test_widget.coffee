chai = require 'chai'
nock = require 'nock'
bean = require 'bean'
dfdom = require '../src/util/dfdom'

chai.should()
assert = chai.assert
expect = chai.expect

hashid = 'ffffffffffffffffffffffffffffffff'
apiKey = 'eu1' # unsecured requests
host   = 'fooserver'
service = nock("http://#{host}")
responseMock = require './util/responsemock'


createController = (widgets...) ->
  client = new doofinder.Client hashid, apiKey, 5, null, host
  queryInput = new doofinder.widgets.QueryInput '#query'
  new doofinder.Controller client, [queryInput, widgets...]

createContainer = (id) ->
  container = document.createElement 'div'
  container.setAttribute 'id', id
  container

prepareResults = (uri, requestBody) ->
  responseMock(hashid, parseInt /query_counter=(\d+)/.exec(uri)[1])

prepareResultsPop = (uri, requestBody) ->
  response = responseMock(hashid, parseInt /query_counter=(\d+)/.exec(uri)[1])
  response.results.pop()
  response

mockSearch = (cb, times = 1) ->
  service
    .get('/5/search')
    .query(true)
    .times(times)
    .reply(cb)

typeSearchTerms = (terms) ->
  input = document.getElementById 'query'
  event = new KeyboardEvent('keydown')
  input.setAttribute 'value', terms
  cancelled = not input.dispatchEvent event


describe 'Widget Tests:', ->
  beforeEach ->
    document.body.innerHTML = '<input type="search" id="query" name="query">'
    global.$ = require "jquery"
    global.doofinder = require "../lib/doofinder"

  afterEach ->
    delete global.$
    delete global.doofinder

  context 'Any widget', ->
    it 'should be able to bind and trigger events', (done) ->
      widget = new doofinder.Widget '#query'
      widget.bind 'df:event', (param1, param2) ->
        param1.should.be.deep.equal {a: {b: 'c'}}
        param2.should.be.equal 'd'
        done()
      widget.trigger 'df:event', [{a: {b: 'c'}}, 'd']


  context 'QueryInput', ->
    it 'should trigger a search request when the third character is typed', (done) ->
      controller = createController()

      searchCalled = false
      controller.search = (query) ->
        searchCalled = true
        query.length.should.be.equal 3
        done()

      # 2-char query, nothing happens
      typeSearchTerms('ch')
      searchCalled.should.be.false

      # 3-char query, search request performed
      typeSearchTerms('cha')

    it 'should trigger a search request when the Nth character is typed when configured', (done) ->
      client = new doofinder.Client hashid, apiKey, 5, null, host
      queryInput = new doofinder.widgets.QueryInput '#query', captureLength: 4
      controller = new doofinder.Controller client, [queryInput]

      searchCalled = false
      controller.search = (query) ->
        searchCalled = true
        query.length.should.be.equal 4
        done()

      # 3-char query, nothing happens
      typeSearchTerms('cha')
      searchCalled.should.be.false

      # 4-char query, search request performed
      typeSearchTerms('chai')


  context 'Results', ->
    beforeEach ->
      mockSearch prepareResults
      document.body.appendChild createContainer('results')
      @resultsWidget = new doofinder.widgets.Results '#results'
      @controller = createController(@resultsWidget)

    it 'should display search results and trigger df:rendered', (done) ->
      resultsContainer = $ '#results'
      @resultsWidget.bind 'df:rendered', (response) ->
        resultsContainer.find('li').length.should.be.equal 2
        resultsContainer.find('li:first').first('b').text().should.contain 'Aironet'
        response.results.length.should.be.equal 2
        done()

      typeSearchTerms('xill')

    it 'should replace search results when second page of results is received', (done) ->
      mockSearch prepareResultsPop

      self = this
      resultsContainer = $('#results')

      searchCalled = 0
      @resultsWidget.bind 'df:rendered', (response) ->
        searchCalled += 1
        if searchCalled == 1
          response.results.length.should.be.equal 2
          resultsContainer.find('li').length.should.be.equal 2
          self.controller.nextPage()
        else if searchCalled == 2
          response.results.length.should.be.equal 1
          resultsContainer.find('li').length.should.be.equal 1
          done()

      typeSearchTerms('sill')

    it 'should accept custom templates, variables and helpers', (done) ->
      document.body.appendChild createContainer('results2')
      resultsWidget2 = new doofinder.widgets.Results '#results2',
        template: """
          <ul>
            {{#results}}
            <li class="{{className}}">
              {{#bold}}{{title}}{{/bold}}: {{description}}
            </li>
            {{/results}}
          </ul>
        """
        templateVars:
          className: 'custom-template'
        templateFunctions:
          bold: ->
            (text, render) ->
              '<b class="bold">' + render(text) + '</b>'
      @controller.addWidget resultsWidget2

      self = this
      resultsContainer2 = $('#results2')

      resultsWidget2.bind 'df:rendered', (response) ->
        response.results.length.should.equal 2
        resultsContainer2.find('li.custom-template').length.should.be.equal 2
        resultsContainer2.find('li b.bold').length.should.be.equal 2
        done()

      typeSearchTerms('zill')


  context 'ScrollResults', ->
    beforeEach ->
      mockSearch prepareResults
      document.body.appendChild createContainer('scroll')
      @resultsWidget = new doofinder.widgets.ScrollResults '#scroll', scrollOffset: 95
      @controller = createController(@resultsWidget)

    it 'should display search results and trigger df:rendered', (done) ->
      resultsContainer = $ '#scroll'
      @resultsWidget.bind 'df:rendered', (response) ->
        resultsContainer.find('li').length.should.be.equal 2
        resultsContainer.find('li:first').first('b').text().should.contain 'Aironet'
        response.results.length.should.be.equal 2
        done()

      typeSearchTerms('xill')

    it 'should append results when second page of results is received', (done) ->
      mockSearch prepareResultsPop

      self = this
      resultsContainer = $('#scroll')

      searchCalled = 0
      @resultsWidget.bind 'df:rendered', (response) ->
        searchCalled += 1
        if searchCalled == 1
          response.results.length.should.be.equal 2
          resultsContainer.find('li').length.should.be.equal 2
          self.controller.nextPage()
        else if searchCalled == 2
          response.results.length.should.be.equal 1
          resultsContainer.find('li').length.should.be.equal 3
          done()

      typeSearchTerms('xill')

    it 'should accept custom templates, variables and helpers', (done) ->
      document.body.appendChild createContainer('scroll2')
      resultsWidget2 = new doofinder.widgets.Results '#scroll2',
        template: """
          <ul>
            {{#results}}
            <li class="{{className}}">
              {{#bold}}{{title}}{{/bold}}: {{description}}
            </li>
            {{/results}}
          </ul>
        """
        templateVars:
          className: 'custom-template'
        templateFunctions:
          bold: ->
            (text, render) ->
              '<b class="bold">' + render(text) + '</b>'
      @controller.addWidget resultsWidget2

      self = this
      resultsContainer2 = $('#scroll2')

      resultsWidget2.bind 'df:rendered', (response) ->
        response.results.length.should.equal 2
        resultsContainer2.find('li.custom-template').length.should.be.equal 2
        resultsContainer2.find('li b.bold').length.should.be.equal 2
        done()

      typeSearchTerms('sill')

    it 'should call nextPage() on df:scroll with custom offset', (done) ->
      resultsContainer = $ '#scroll'

      @resultsWidget.elementWrapper.attr 'style', 'position: relative; height: 800px; overflow-x: hidden; overflow-y: scroll;'
      @resultsWidget.element.attr 'style', 'height: 1200px;'
      # jsdom doesn't update clientHeight nor clientWidth when applying styles
      # this hack is to make dfScroll find proper values when asking the DOM
      # elements for these values
      @resultsWidget.elementWrapper.element.clientHeight = 800
      @resultsWidget.element.element.clientHeight = 1200

      self = this

      # 1. Scroll until one pixel below the limit, trigger df:scroll and nothing
      # should happen.
      # 2. Request the first page of results. Once rendered scroll to the limit
      # and trigger df:scroll. Now, df:next_page should be called.

      nextPageCalled = 0
      dfScrollCalled = 0

      @controller.bind 'df:next_page', ->
        nextPageCalled += 1

      bean.on @resultsWidget.elementWrapper, 'df:scroll', ->
        dfScrollCalled += 1
        if dfScrollCalled == 1
          nextPageCalled.should.equal 0
        else
          nextPageCalled.should.equal 1
          done()

      @resultsWidget.bind 'df:rendered', (response) ->
        if dfScrollCalled == 1
          self.resultsWidget.elementWrapper.scrollTop = 305 # on the limit
          bean.fire self.resultsWidget.elementWrapper, 'df:scroll'

      # 1. Scroll until one pixel below the limit...
      @resultsWidget.elementWrapper.scrollTop = 304
      bean.fire @resultsWidget.elementWrapper, 'df:scroll'

      # 2. now, search
      typeSearchTerms('zill')


  context 'TermFacet', ->
    beforeEach ->
      mockSearch prepareResults
      document.body.appendChild createContainer('terms')
      @controller = createController()

    it 'should trigger df:rendered event and display all terms returned in the response', (done) ->
      termsWidget = new doofinder.widgets.TermFacet '#terms', 'color'
      @controller.addWidget termsWidget
      termsContainer = $('#terms')

      termsWidget.bind 'df:rendered', (response) ->
        response.results.length.should.equal 2
        termsContainer.find('.df-facet').length.should.equal 2
        done()

      typeSearchTerms('pill')

    it 'should add a filter when a term is clicked and remove it on a second click', (done) ->
      mockSearch prepareResults, 2 # an extra search when facet is clicked
      termsWidget = new doofinder.widgets.TermFacet '#terms', 'color'
      @controller.addWidget termsWidget
      termsContainer = $('#terms')

      self = this
      renderCount = 0

      termsWidget.bind 'df:rendered', (e, response) ->
        renderCount += 1
        term = termsContainer.find('a[data-facet="color"][data-value="Azul"]').get(0)
        if renderCount == 1
          # initial search
          self.controller.status.params.filters.should.be.empty
          bean.fire term, 'click'
        else if renderCount == 2
          self.controller.status.params.filters.should.have.keys 'color'
          self.controller.status.params.filters.color.should.be.an.Array
          self.controller.status.params.filters.color.should.eql ['Azul']
          bean.fire term, 'click'
        else
          self.controller.status.params.filters.color.should.be.empty
          done()

      typeSearchTerms('lill')

    it 'should render custom templates', (done) ->
      options =
        template: """
          <div class="df-facets custom {{customVar}}">
            <a href="#" class="df-panel__title" data-toggle="panel">{{label}}</a>
            <div class="df-facets__content">
              <ul>
                {{#terms.length}}
                  <li>
                    <a href="#" class="df-facet{{#selected}} df-facet--active{{/selected}}"
                        data-facet="{{name}}" data-value="{{ key }}">
                      {{ key }}
                      <span class="df-facet__count">{{ doc_count }}</span>
                    </a>
                  </li>
                {{/terms.length}}
              </ul>
            </div>
          </div>
        """
        templateVars:
          customVar: 'customValue'
      termsWidget = new doofinder.widgets.TermFacet '#terms', 'color', options
      @controller.addWidget termsWidget
      termsContainer = $('#terms')

      termsWidget.bind 'df:rendered', (response) ->
        termsContainer.find('div.custom').length.should.equal 1
        termsContainer.find('div.customValue').length.should.equal 1
        done()

      typeSearchTerms('xixx')


  context 'RangeFacet', ->
    it 'should display range values from the response and trigger df:rendered', (done) ->
      mockSearch prepareResults

      # Create DOM node for RangeFacet Widget
      document.body.appendChild createContainer('rangefacet')
      rangefacetNode = $('#rangefacet')

      # Create RangeFacet Widget instance
      rangefacet = new doofinder.widgets.RangeFacet('#rangefacet', 'best_price')
      console.log rangefacet.element
      console.log "HPS"

      rangefacet.bind 'df:rendered', (response) ->
        console.log "RENDERED"
        rangefacetNode.find('.noUi-handle-lower > .noUi-tooltip').first().text().should.be.eql '8.5'
        rangefacetNode.find('.noUi-handle-upper > .noUi-tooltip').first().text().should.be.eql '225'
        done()

      createController(rangefacet)
      console.log "DESPUES CREATE CONTROLLER"
      typeSearchTerms('pill')
      console.log "DESPUES DE SEARCH"
