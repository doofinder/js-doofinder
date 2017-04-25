extend = require "extend"
$ = require "../../util/dfdom"
Display = require "../display"
uniqueId = require "../../util/uniqueid"


###*
 * Collapsible panel that contains a facet widget.
 * It's always appended to a container element, it does not replace the entire
 * HTML content.
###
class FacetPanel extends Display
  @defaultTemplate = """
    <div id="{{id}}" data-role="panel">
      <a href="#" data-role="panel-label" data-toggle="panel"></a>
      <div data-role="panel-content"></div>
    </div>
  """

  constructor: (element, options) ->
    uid = "df-panel-#{uniqueId()}"
    defaults =
      id: uid
      template: @constructor.defaultTemplate
      startCollapsed: false
      templateVars:
        id: options.id or uid
    options = extend true, defaults, options

    super element, options.template, options

    # Render as soon as possible!
    @element.append (@mustache.render @template, (@addHelpers {}))
    # Once appended, change the @element reference to the panel itself instead
    # of the container.
    @setElement "##{@options.id}"
    @collapse() if @options.startCollapsed

    # Initialize accessors to important nodes
    @toggleElement = (@element.find '[data-toggle="panel"]').first()
    @labelElement = (@element.find '[data-role="panel-label"]').first()
    @contentElement = (@element.find '[data-role="panel-content"]').first()

  init: (@controller) ->
    @toggleElement.on "click", (e) =>
      e.preventDefault()
      if @isCollapsed() then @expand() else @collapse()

  isCollapsed: ->
    (@element.attr "data-collapse")?

  collapse: ->
    @element.attr "data-collapse", ""

  expand: ->
    @element.removeAttr "data-collapse"

  ###*
   * Embeds one and only one widget into this panel content.
   * @param  {Widget} embeddedWidget A (child) instance of `Widget`.
  ###
  embedWidget: (embeddedWidget) ->
    if @embeddedWidget?
      @raiseError "You can embed only one item on a `FacetPanel` instance."
    else
      @embeddedWidget = embeddedWidget
      @controller.addWidget @embeddedWidget

  ###*
   * Renders the panel title with the label obtained from the embedded widget.
   * @param  {Object} res Search response from the server.
  ###
  render: (res) ->
    if @embeddedWidget?
      @labelElement.html (@embeddedWidget.renderLabel res)
      @trigger "df:rendered", [res]

  renderNext: (res) ->

  clean: () ->


module.exports = FacetPanel
