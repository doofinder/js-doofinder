describe "Default Widgets", ->
  insertHTML = (html) ->
    document.body.innerHTML = html

  getController = ->
    client = new doofinder.Client "ffffffffffffffffffffffffffffffff"
    new doofinder.Controller client

  getControllerMock = ->
    mock =
      addFilter: (key, value) ->
      removeFilter: (key) ->
      refresh: ->

  $ = doofinder.util.dfdom
  controller = null

  afterEach: ->
    controller = null
    insertHTML ""

  describe "Widget", ->
    Widget = doofinder.widgets.Widget

    it "triggers event on init", (done) ->
      widget = new Widget window
      widget.initialized.should.be.false
      widget.on "df:widget:init", ->
        @initialized.should.be.true
        (expect @controller).to.be.null
        done()
      widget.init()

    it "is automatically initialized when registered in controller", (done) ->
      controller = getController()
      widget = new Widget window
      widget.on "df:widget:init", ->
        @controller.should.equal controller
        done()
      controller.registerWidget widget

    it "is assigned the first element item found", (done) ->
      insertHTML """
        <div class="widget" id="widget1"></div>
        <div class="widget" id="widget2"></div>
      """
      node = $ "#widget1"
      widget = new Widget ".widget"
      (widget.element.get 0).should.equal (node.get 0)
      done()

    it "triggers event on render", (done) ->
      widget = new Widget window
      widget.on "df:widget:render", -> done()
      widget.render()

    it "triggers event on clean", (done) ->
      widget = new Widget window
      widget.on "df:widget:clean", -> done()
      widget.clean()

  describe "Display", ->
    Display = doofinder.widgets.Display

    helpersTestTemplate = """
      {{#query}}
        <div id="query">{{query}}</div>
      {{/query}}
      <div id="url">{{#url-params}}{{url}}{{/url-params}}</div>
      <div id="image">{{#remove-protocol}}{{image}}{{/remove-protocol}}</div>
      <div id="translate">{{#translate}}Hello!{{/translate}}</div>
      <div id="currency">{{#format-currency}}{{price}}{{/format-currency}}</div>
      {{#is_first}}<div id="first"></div>{{/is_first}}
      {{#is_last}}<div id="last"></div>{{/is_last}}
      {{#greeting}}<div id="greeting">{{greeting}}</div>{{/greeting}}
      {{#bold}}Hola{{/bold}}
    """

    it "properly renders itself", (done) ->
      insertHTML """<div id="widget">BYE, BYE</div>"""
      widget = new Display "#widget", template: "HELLO!"
      widget.on "df:widget:render", (res) ->
        ($ "#widget").html().should.equal "HELLO!"
        done()
      widget.render()

    it "properly cleans itself", (done) ->
      insertHTML """<div id="widget">BYE, BYE</div>"""
      widget = new Display "#widget", template: "HELLO!"
      widget.on "df:widget:clean", (res) ->
        ($ "#widget").html().should.equal ""
        done()
      widget.clean()

    it "properly builds default render context", (done) ->
      insertHTML """<div id="widget"></div>"""
      widget = new Display "#widget", template: helpersTestTemplate
      widget.on "df:widget:render", (res) ->
        ($ "#first").length.should.equal 0
        ($ "#last").length.should.equal 0
        ($ "#query").length.should.equal 0
        ($ "#greeting").length.should.equal 0
        ($ "#url").html().should.equal "https://www.doofinder.com"
        ($ "#image").html().should.equal "//www.doofinder.com/image.png"
        ($ "#translate").html().should.equal "Hello!"
        ($ "#currency").html().should.equal "1.000,50€"
        done()
      widget.render
        price: 1000.5
        url: "https://www.doofinder.com"
        image: "https://www.doofinder.com/image.png"

    it "properly builds custom render context", (done) ->
      insertHTML """<div id="widget"></div>"""
      options =
        template: helpersTestTemplate
        queryParam: "q"
        urlParams:
          source: "karma"
        templateVars:
          greeting: "Hello!"
        templateFunctions:
          bold: ->
            (text, render) ->
              "<b>#{render text}</b>"
      widget = new Display "#widget", options
      widget.on "df:widget:render", (res) ->
        ($ "#first").length.should.equal 1
        ($ "#last").length.should.equal 1
        ($ "b").length.should.equal 1
        ($ "#query").html().should.equal "hola"
        ($ "#greeting").html().should.equal "Hello!"
        # Mustache escapes result and there's no unescape option!!!
        ($ "#url").html().should.equal "https://www.doofinder.com?source=karma&amp;q=hola"
        ($ "#image").html().should.equal "//www.doofinder.com/image.png"
        ($ "#translate").html().should.equal "Hola!"
        ($ "#currency").html().should.equal "$1,000.50"
        done()
      widget.render
        price: 1000.5
        url: "https://www.doofinder.com"
        image: "https://www.doofinder.com/image.png"
        query: "hola"
        page: 1
        total: 10
        results_per_page: 10
        currency:
          symbol: '$'
          format: '%s%v'
          decimal: '.'
          thousand: ','
          precision: 2
        translations:
          "Hello!": "Hola!"

  describe "ScrollDisplay", ->
    ScrollDisplay = doofinder.widgets.ScrollDisplay

  describe "TermsFacet", ->
    TermsFacet = doofinder.widgets.TermsFacet

    createWidget = (options) ->
      insertHTML """<div id="widget"></div>"""
      widget = new TermsFacet "#widget", "brand", options
      # code is currently too coupled to controller so we need a mock
      widget.setController getControllerMock()
      widget.init()
      widget

    termsFacetResponse = ->
      response =
        page: 1
        filter: terms: brand: [ 'CONCORD' ]
        facets: brand: terms: buckets: [
            key: 'CONCORD'
            doc_count: 20
          ,
            key: 'JANE'
            doc_count: 10
          ,
            key: 'MACLAREN'
            doc_count: 5
          ,
            key: 'BE COOL'
            doc_count: 2
        ]

    it "renders properly and is not collapsible by default", (done) ->
      widget = createWidget()

      widget.on "df:widget:render", (res) ->
        @collapsed.should.be.false

        res.facets.brand.terms.buckets[0].index.should.equal 0
        res.facets.brand.terms.buckets[0].name.should.equal widget.facet
        res.facets.brand.terms.buckets[0].selected.should.be.true

        res.facets.brand.terms.buckets[1].index.should.equal 1
        res.facets.brand.terms.buckets[1].name.should.equal widget.facet
        res.facets.brand.terms.buckets[1].selected.should.be.false

        (@element.find "[data-facet]").length.should.equal 4
        (@element.find "[data-selected]").length.should.equal 1
        (@element.find "[data-extra-content]").length.should.equal 0
        @getButton().length.should.equal 0

        selectedTerm = (@element.find "[data-selected]").first()
        (selectedTerm.find ".df-term__value").html().trim().should.equal "CONCORD"
        (selectedTerm.find ".df-term__count").html().trim().should.equal "20"
        done()

      widget.render termsFacetResponse()

    it "unselects selected terms when clicked", (done) ->
      widget = createWidget()

      widget.on "df:term:click", (facetName, facetValue, isSelected) ->
        facetName.should.equal "brand"
        facetValue.should.equal "CONCORD"
        isSelected.should.be.false
        done()

      widget.on "df:widget:render", (res) ->
        (@element.find "[data-facet='brand'][data-value='CONCORD']").trigger "click"

      widget.render termsFacetResponse()

    it "selects not selected terms when clicked", (done) ->
      widget = createWidget()

      widget.on "df:term:click", (facetName, facetValue, isSelected) ->
        facetName.should.equal "brand"
        facetValue.should.equal "CONCORD"
        isSelected.should.be.true
        done()

      widget.on "df:widget:render", (res) ->
        (@element.find "[data-facet='brand'][data-value='CONCORD']").trigger "click"

      response = termsFacetResponse()
      delete response.filter

      widget.render response

    it "has collapse feature if size option is provided", (done) ->
      widget = createWidget size: 2

      widget.on "df:widget:render", (res) ->
        @collapsed.should.be.true

        (@element.find "[data-facet]").length.should.equal 4
        (@element.find "[data-selected]").length.should.equal 1
        (@element.find "[data-extra-content]").length.should.equal 2
        (@element.hasAttr "data-view-extra-content").should.be.false

        button = @getButton()
        button.length.should.equal 1
        button.html().trim().should.equal "View more…"

        @on "df:collapse:change", (isCollapsed) =>
          if not @collapsed
            (@element.hasAttr "data-view-extra-content").should.be.true
            button.html().trim().should.equal "View less…"
            button.trigger "click"
          else
            (@element.hasAttr "data-view-extra-content").should.be.false
            button.html().trim().should.equal "View more…"
            done()

        button.trigger "click"

      widget.render termsFacetResponse()


  describe "RangeFacet", ->
    RangeFacet = doofinder.widgets.RangeFacet

  describe "Panel", ->
    Panel = doofinder.widgets.Panel

  describe "CollapsiblePanel", ->
    CollapsiblePanel = doofinder.widgets.CollapsiblePanel

  describe "QueryInput", ->
    QueryInput = doofinder.widgets.QueryInput
