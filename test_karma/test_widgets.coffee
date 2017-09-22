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
    it "is automatically initialized when registered in controller", (done) ->
      controller = getController()
      widget = new doofinder.widgets.Widget window
      widget.initialized.should.be.false
      widget.on "df:widget:init", ->
        @initialized.should.be.true
        done()
      controller.registerWidget widget

    it "triggers event on render", (done) ->
      widget = new doofinder.widgets.Widget window
      widget.on "df:widget:render", -> done()
      widget.render()

    it "triggers event on clean", (done) ->
      widget = new doofinder.widgets.Widget window
      widget.on "df:widget:clean", -> done()
      widget.clean()

  describe "Display", ->
    it "properly renders itself", (done) ->
      insertHTML """<div id="widget">BYE, BYE</div>"""
      widget = new doofinder.widgets.Display "#widget", template: "HELLO!"
      widget.on "df:widget:render", (res) ->
        ($ "#widget").html().should.equal "HELLO!"
        done()
      widget.render()

    it "properly cleans itself", (done) ->
      insertHTML """<div id="widget">BYE, BYE</div>"""
      widget = new doofinder.widgets.Display "#widget", template: "HELLO!"
      widget.on "df:widget:clean", (res) ->
        ($ "#widget").html().should.equal ""
        done()
      widget.clean()
