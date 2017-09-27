describe "Default Widgets", ->
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

    it "cleans itself if there are no terms", (done) ->
      widget = createWidget()

      widget.on "df:widget:clean", ->
        widget.element.html().trim().should.equal ""
        done()

      widget.render
        page: 1
        facets: brand: terms: buckets: []

    it "does nothing if response is for a secondary page", (done) ->
      widget = createWidget()
      (widget.render page: 2).should.be.false
      done()

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

    createWidget = (options) ->
      insertHTML """<div id="widget"></div>"""
      widget = new RangeFacet "#widget", "best_price", options
      # code is currently too coupled to controller so we need a mock
      widget.setController getControllerMock()
      widget.init()
      widget

    rangeFacetResponse = ->
      response =
        page: 1
        filter: range: best_price:
          lte: 1687.038055582841
          gte: 7.900000095367432
        facets: best_price:
          range: buckets: [ {
            stats:
              sum: 522389.32065343857
              min: 7.900000095367432
              max: 2360.0
              count: 1687
              avg: 309.6557917329215
            key: '0.0-*'
            from_as_string: '0.0'
            from: 0.0
            doc_count: 1687
          } ]
          doc_count: 1687

    it "renders properly when min and max values differ", (done) ->
      widget = createWidget()
      widget.on "df:widget:render", (res) ->
        ($ ".df-slider").length.should.equal 1
        ($ ".noUi-tooltip").length.should.equal 2
        (($ ".noUi-tooltip").item 0).html().should.equal "7.9"
        (($ ".noUi-tooltip").item 1).html().should.equal "2360"
        ($ ".noUi-value[data-position='0']").html().should.equal "7.9"
        ($ ".noUi-value[data-position='100']").html().should.equal "2360"
        done()
      response = rangeFacetResponse()
      delete response.filter
      widget.render response

    it "applies filter values if differ from min and max", (done) ->
      widget = createWidget()
      widget.on "df:widget:render", (res) ->
        (($ ".noUi-tooltip").item 0).html().should.equal "7.9"
        (($ ".noUi-tooltip").item 1).html().should.equal "1687.04"
        ($ ".noUi-value[data-position='0']").html().should.equal "7.9"
        ($ ".noUi-value[data-position='100']").html().should.equal "2360"
        done()
      widget.render rangeFacetResponse()

    it "refreshes when range changes", (done) ->
      widget = createWidget()
      widget.on "df:widget:render", ->
        @set [100, 1000]
      widget.on "df:range:change", (value, range) ->
        value.gte.should.equal 100
        value.lte.should.equal 1000
        range.min.should.equal 7.900000095367432
        range.max.should.equal 2360.0
        done()
      widget.render rangeFacetResponse()

    it "cleans itself when min and max values are equal", (done) ->
      widget = createWidget()
      widget.on "df:widget:clean", -> done()
      response = rangeFacetResponse()
      delete response.filter
      value = response.facets.best_price.range.buckets[0].stats.min
      response.facets.best_price.range.buckets[0].stats.max = value
      widget.render response

    it "does nothing if response is for a secondary page", (done) ->
      widget = createWidget()
      (widget.render page: 2).should.be.false
      done()

    it "formats values with custom format function if specified", (done) ->
      formatFn = (value) ->
        doofinder.util.currency.format value,
          symbol: '$'
          format: '%s%v'
          decimal: '.'
          thousand: ','
          precision: 3

      widget = createWidget format: formatFn
      widget.on "df:widget:render", (res) ->
        (($ ".noUi-tooltip").item 0).html().should.equal "$7.900"
        (($ ".noUi-tooltip").item 1).html().should.equal "$1,687.038"
        ($ ".noUi-value[data-position='0']").html().should.equal "$7.900"
        ($ ".noUi-value[data-position='100']").html().should.equal "$2,360"
        done()
      widget.render rangeFacetResponse()

  describe "Panel", ->
    Display = doofinder.widgets.Display
    Panel = doofinder.widgets.Panel

    createWidget = (options) ->
      insertHTML """
        <div>
          <div id="widget">
            <p>HI!</p>
          </div>
        </div>
      """
      createDisplay = (panel) ->
        new Display panel.contentElement, template: """HELLO!"""
      defaults =
        templateVars:
          panelElement: "panel"
          labelElement: "label"
          contentElement: "content"
      options = doofinder.util.extend true, defaults, options
      widget = new Panel "#widget", createDisplay, options
      # code is currently too coupled to controller so we need a mock
      widget.setController getControllerMock()
      widget.init()
      widget

    it "properly renders itself replacing element content by default", (done) ->
      widget = createWidget()
      widget.on "df:widget:render", (res) ->
        ($ "#widget").html().should.not.equal "<p>HI!</p>"
        ($ "#panel").length.should.equal 1
        ($ "#label").length.should.equal 0
        ($ "#content").length.should.equal 1
        ($ "#content").html().should.equal "HELLO!"
        done()
      widget.render()

    it "can prepend itself inside the element", (done) ->
      widget = createWidget insertionMethod: "prepend"
      widget.on "df:widget:render", (res) ->
        children = ($ "#widget").children()
        children.length.should.equal 2
        (children.get 0).should.equal (($ "#panel").get 0)
        (children.item 1).html().should.equal "HI!"
        ($ "#content").html().should.equal "HELLO!"
        done()
      widget.render()

    it "can append itself inside the element", (done) ->
      widget = createWidget insertionMethod: "append"
      widget.on "df:widget:render", (res) ->
        children = ($ "#widget").children()
        children.length.should.equal 2
        (children.item 0).html().should.equal "HI!"
        (children.get 1).should.equal (($ "#panel").get 0)
        ($ "#content").html().should.equal "HELLO!"
        done()
      widget.render()

    it "can attach itself before the element", (done) ->
      widget = createWidget insertionMethod: "before"
      widget.on "df:widget:render", (res) ->
        children = ($ "#widget").children()
        children.length.should.equal 1
        (children.item 0).html().should.equal "HI!"
        ($ "#widget").siblings().length.should.equal 1
        ((($ "#widget").siblings().item 0).attr "id").should.equal "panel"
        done()
      widget.render()

    it "can attach itself after the element", (done) ->
      widget = createWidget insertionMethod: "after"
      widget.on "df:widget:render", (res) ->
        children = ($ "#widget").children()
        children.length.should.equal 1
        (children.item 0).html().should.equal "HI!"
        ($ "#widget").siblings().length.should.equal 1
        ((($ "#widget").siblings().item 0).attr "id").should.equal "panel"
        done()
      widget.render()

  describe "CollapsiblePanel", ->
    Display = doofinder.widgets.Display
    CollapsiblePanel = doofinder.widgets.CollapsiblePanel

    createWidget = (options) ->
      insertHTML """<div id="widget"></div>"""
      createDisplay = (panel) ->
        new Display panel.contentElement, template: """HELLO!"""
      defaults =
        templateVars:
          panelElement: "panel"
          labelElement: "label"
          contentElement: "content"
      options = doofinder.util.extend true, defaults, options
      widget = new CollapsiblePanel "#widget", createDisplay, options
      # code is currently too coupled to controller so we need a mock
      widget.setController getControllerMock()
      widget.init()
      widget

    it "properly renders itself with default options", (done) ->
      widget = createWidget()
      widget.on "df:widget:render", (res) ->
        ($ "#widget").html().should.not.equal ""
        ($ "#panel").length.should.equal 1
        ($ "#label").length.should.equal 1
        ($ "#label").html().should.equal "Untitled"
        ($ "#content").length.should.equal 1
        ($ "#content").html().should.equal "HELLO!"
        @isCollapsed.should.be.false
        done()
      widget.render()

    it "properly renders itself with custom options", (done) ->
      widget = createWidget startCollapsed: true, templateVars: label: "My Panel"
      widget.on "df:widget:render", (res) ->
        ($ "#label").html().should.equal "My Panel"
        @isCollapsed.should.be.true
        done()
      widget.render()

    it "toggles content when label is clicked", (done) ->
      widget = createWidget()
      widget.on "df:widget:render", (res) ->
        # 1. starts expanded
        @isCollapsed.should.be.false
        @on "df:collapse:change", (collapsed) ->
          @isCollapsed.should.equal collapsed
          if collapsed
            # 3. expand
            ($ "#label").trigger "click"
          else
            # 4. OK!
            done()
        # 2. collapse
        ($ "#label").trigger "click"
      widget.render()

  describe "QueryInput", ->
    QueryInput = doofinder.widgets.QueryInput

    createWidget = (controller, value = "", options = {}) ->
      insertHTML """<input id="widget" type="text" value="#{value}">"""
      defaults =
        typingTimeout: 50
      options = doofinder.util.extend true, defaults, options
      widget = new QueryInput "#widget", options
      # code is currently too coupled to controller so we need a mock
      widget.setController controller
      widget.init()
      widget

    createEnterKeydownEvent = ->
      e = new Event "keydown"
      e.key = "Enter"
      e.keyCode = 13
      e.which = 13
      e.altKey = false
      e.ctrlKey = false
      e.shiftKey = false
      e.metaKey = false
      e.bubbles = true
      e

    it "erases input value on clean by default", (done) ->
      controller = getControllerMock()
      widget = createWidget controller, "something"
      widget.on "df:widget:render", ->
        @value.should.equal "something"
        controller.searchDone.should.be.false
        @clean()
      widget.on "df:widget:clean", ->
        @value.should.equal ""
        controller.searchDone.should.be.false
        done()
      widget.render()

    it "doesn't erase input value on clean if disabled in options", (done) ->
      controller = getControllerMock()
      widget = createWidget controller, "something", clean: false
      widget.on "df:widget:render", ->
        @value.should.equal "something"
        controller.searchDone.should.be.false
        @clean()
      widget.on "df:widget:clean", ->
        @value.should.equal "something"
        controller.searchDone.should.be.false
        done()
      widget.render()

    it "searches when input is 3-char length or longer", (done) ->
      controller = getControllerMock()
      widget = createWidget controller
      widget.on "df:input:stop", (value) ->
        @value.should.equal value
        controller.searchDone.should.be.true
        done()
      widget.value = "123"

    it "can expect a configured minimum input text length", (done) ->
      controller = getControllerMock()
      widget = createWidget controller, "", captureLength: 4
      widget.on "df:input:stop", (value) ->
        @value.should.equal value
        controller.searchDone.should.be.true
        done()
      widget.value = "1234"

    it "doesn't search if input is not at least 3-char long", (done) ->
      controller = getControllerMock()
      widget = createWidget controller

      widget.on "df:input:stop", (value) ->
        # this should never be executed
        (expect true).to.be.false

      widget.value = "12"
      setTimeout (->
        controller.searchDone.should.be.false
        done()
      ), widget.options.typingTimeout

    it "can use multiple controllers", (done) ->
      controllers = [
        getControllerMock(),
        getControllerMock(),
        getControllerMock()
      ]
      widget = createWidget controllers
      widget.on "df:input:stop", (value) ->
        @value.should.equal value
        controllers.forEach (controller) ->
          controller.searchDone.should.be.true
        done()
      widget.value = "123"

    it "triggers a special event for enter key if input is not a textarea", (done) ->
      controller = getControllerMock()
      widget = createWidget controller, "something"
      widget.on "df:input:submit", (value) ->
        value.should.equal "something"
      widget.on "df:input:stop", ->
        controller.searchDone.should.be.true
        done()
      (widget.element.get 0).dispatchEvent createEnterKeydownEvent()

    it "doesn't trigger a special event for enter key if input is a textarea", (done) ->
      insertHTML """<textarea id="widget">something</textarea>"""
      controller = getControllerMock()
      widget = new QueryInput "#widget", typingTimeout: 50
      # code is currently too coupled to controller so we need a mock
      widget.setController controller
      widget.init()

      widget.on "df:input:submit", (value) ->
        # this should never be executed
        (expect true).to.be.false

      widget.value.should.equal "something"
      (widget.element.get 0).dispatchEvent createEnterKeydownEvent()

      setTimeout (->
        widget.value.should.equal "something"
        controller.searchDone.should.be.false
        done()
      ), widget.options.typingTimeout


  describe "ScrollDisplay", ->
    ScrollDisplay = doofinder.widgets.ScrollDisplay
