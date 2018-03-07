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

    context "basic render and clean", ->
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

    context "render context", ->
      helpersTestTemplate = """
        <div id="translate">{{#translate}}Hello!{{/translate}}</div>
        {{#is_first}}<div id="first"></div>{{/is_first}}
        {{#is_last}}<div id="last"></div>{{/is_last}}
        {{#greeting}}<div id="greeting">{{greeting}}</div>{{/greeting}}
        {{#bold}}Hola{{/bold}}
      """

      beforeEach ->
        insertHTML """<div id="widget"></div>"""

      it "properly builds default render context", (done) ->
        widget = new Display "#widget", template: helpersTestTemplate
        widget.one "df:widget:render", (res) ->
          ($ "#first").length.should.equal 0
          ($ "#last").length.should.equal 0
          ($ "#greeting").length.should.equal 0
          ($ "#translate").html().should.equal "Hello!"
          done()
        widget.render()

      it "properly builds custom render context", (done) ->
        widget = new Display "#widget",
          template: helpersTestTemplate
          templateVars:
            greeting: "Hello!"
          translations:
            "Hello!": "Hola!"
          templateFunctions:
            bold: -> (text, render) -> "<b>#{render text}</b>"

        widget.one "df:widget:render", (res) ->
          ($ "#first").length.should.equal 1
          ($ "#last").length.should.equal 1
          ($ "b").length.should.equal 1
          ($ "#greeting").html().should.equal "Hello!"
          ($ "#translate").html().should.equal "Hola!"
          done()

        widget.render
          page: 1
          total: 10
          results_per_page: 10

  describe "Terms Facet Widgets", ->
    TermsFacet = doofinder.widgets.TermsFacet

    createWidget = (klass, options) ->
      insertHTML """<div id="widget"></div>"""
      widget = new klass "#widget", "brand", options
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

    context "TermsFacet", ->
      it "renders properly", (done) ->
        widget = createWidget TermsFacet
        widget.on "df:widget:render", (res) ->
          res.facets.brand.terms.buckets[0].index.should.equal 0
          res.facets.brand.terms.buckets[0].name.should.equal widget.facet
          res.facets.brand.terms.buckets[0].selected.should.be.true

          res.facets.brand.terms.buckets[1].index.should.equal 1
          res.facets.brand.terms.buckets[1].name.should.equal widget.facet
          res.facets.brand.terms.buckets[1].selected.should.be.false

          (@element.find "[data-facet]").length.should.equal 4
          (@element.find "[data-selected]").length.should.equal 1

          selectedTerm = (@element.find "[data-selected]").first()
          (selectedTerm.find ".df-term__value").html().trim().should.equal "CONCORD"
          (selectedTerm.find ".df-term__count").html().trim().should.equal "20"
          done()
        widget.render termsFacetResponse()

      it "cleans itself if there are no terms", (done) ->
        widget = createWidget TermsFacet

        widget.on "df:widget:clean", ->
          widget.element.html().trim().should.equal ""
          done()

        widget.render
          page: 1
          facets: brand: terms: buckets: []

      it "does nothing if response is for a secondary page", (done) ->
        widget = createWidget TermsFacet
        (widget.render page: 2).should.be.false
        done()

      it "unselects selected terms when clicked", (done) ->
        widget = createWidget TermsFacet

        widget.on "df:term:click", (facetName, facetValue, isSelected) ->
          facetName.should.equal "brand"
          facetValue.should.equal "CONCORD"
          isSelected.should.be.false
          done()

        widget.on "df:widget:render", (res) ->
          (@element.find "[data-facet='brand'][data-value='CONCORD']").trigger "click"

        widget.render termsFacetResponse()

      it "selects not selected terms when clicked", (done) ->
        widget = createWidget TermsFacet

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
        value.start.should.equal 100
        value.end.should.equal 1000
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
      expect(widget.render page: 2).to.be.undefined
      done()

    it "formats values with custom format function if specified", (done) ->
      widget = createWidget format: (value) -> "$#{value.toFixed 3}"
      widget.on "df:widget:render", (res) ->
        (($ ".noUi-tooltip").item 0).html().should.equal "$7.900"
        (($ ".noUi-tooltip").item 1).html().should.equal "$1687.038"
        ($ ".noUi-value[data-position='0']").html().should.equal "$7.900"
        ($ ".noUi-value[data-position='100']").html().should.equal "$2360.000"
        done()
      widget.render rangeFacetResponse()

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

    createInputEvent = ->
      e = new Event "input"
      e.bubbles = false
      e.cancelable = false
      e.type = "input"
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

    it "can use multiple inputs", (done) ->
      insertHTML """<input class="widget" type="text" value="something">
                    <input class="widget" type="text" value="something">
                    <input class="widget" type="text" value="something">
                    <textarea class="widget">something</textarea>"""
      controller = getControllerMock()
      widget = new QueryInput ".widget", typingTimeout: 50
      widget.setController controller
      widget.init()

      (widget.element.get 1).value = "something1"
      (widget.element.get 1).dispatchEvent createInputEvent()
      widget.value.should.equal "something1"
      (widget.element.get 0).value = "something0"
      (widget.element.get 0).dispatchEvent createInputEvent()
      widget.value.should.equal "something0"
      (widget.element.get 2).value = "something2"
      (widget.element.get 2).dispatchEvent createInputEvent()
      widget.value.should.equal "something2"
      (widget.element.get 3).value = "something3"
      (widget.element.get 3).dispatchEvent createInputEvent()
      widget.value.should.equal "something3"
      done()


  describe "ScrollDisplay", ->
    ScrollDisplay = doofinder.widgets.ScrollDisplay
