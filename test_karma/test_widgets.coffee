describe "Default Widgets", ->
  insertHTML = (html) ->
    document.body.innerHTML = html

  getController = ->
    client = new doofinder.Client "ffffffffffffffffffffffffffffffff"
    new doofinder.Controller client

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
        # Mustaches escapes result and there's no unescape option!!!
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
  describe "Panel", ->
  describe "CollapsiblePanel", ->
  describe "TermsFacet", ->
  describe "RangeFacet", ->
  describe "QueryInput", ->
