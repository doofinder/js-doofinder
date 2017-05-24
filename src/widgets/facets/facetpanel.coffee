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

  ###*
   * @param  {String|Node|DfDomElement} element  Container node.
   * @param  {Object} options Options object. Empty by default.
  ###
  constructor: (element, options = {}) ->
    uid = "df-panel-#{uniqueId()}"

    defaults =
      id: uid
      template: @constructor.defaultTemplate
      startHidden: true     # Hide the panel until the embedded widget has been
                            # rendered.
      startCollapsed: false # Render collapsed instead of expanded.
      templateVars:
        id: options.id or uid

    options = extend true, defaults, options
    super element, options.template, options

    # Render as soon as possible!
    @element.append (@mustache.render @template, @addHelpers())
    # Once appended, change the @element reference to the panel itself instead
    # of the container.
    @setElement "##{@options.id}"

    # Initialize accessors to important nodes
    @toggleElement = (@element.find '[data-toggle="panel"]').first()
    @labelElement = (@element.find '[data-role="panel-label"]').first()
    @contentElement = (@element.find '[data-role="panel-content"]').first()

    # Reset to finish initialization
    @clean()

  ###*
   * Initializes the object with a controller and attachs event handlers for
   * this widget instance.
   *
   * @param  {Controller} controller Doofinder Search controller.
  ###
  init: (controller) ->
    super
    @toggleElement.on "click", (e) =>
      e.preventDefault()
      if @isCollapsed() then @expand() else @collapse()

  ###*
   * Checks whether the panel is collapsed or not.
   * @return {Boolean} `true` if the panel is collapsed, `false` otherwise.
  ###
  isCollapsed: ->
    (@element.attr "data-collapse")?

  ###*
   * Collapses the panel to hide its content.
  ###
  collapse: ->
    @element.attr "data-collapse", ""

  ###*
   * Expands the panel to display its content.
  ###
  expand: ->
    @element.removeAttr "data-collapse"

  ###*
   * Embeds one and only one widget into this panel content. If the panel is
   * rendered hidden (default), we listen for the first rendering of the
   * embedded widget and then we display it.
   *
   * @param  {Widget} embeddedWidget A (child) instance of `Widget`.
  ###
  embedWidget: (embeddedWidget) ->
    if @embeddedWidget?
      @raiseError "You can embed only one item on a `FacetPanel` instance."
    else
      @embeddedWidget = embeddedWidget
      # auto-show when the embedded widget is rendered
      @embeddedWidget.bind "df:rendered", (=> @element.css "display", "inherit")
      # auto-hide when the embedded widget is cleaned
      @embeddedWidget.bind "df:cleaned", (=> @element.css "display", "none")

  ###*
   * Called when the "first page" response for a specific search is received.
   * Renders the panel title with the label obtained from the embedded widget.
   * This method does not replace its own HTML code, only the HTML of specific
   * parts.
   *
   * @param {Object} res Search response.
   * @fires FacetPanel#df:rendered
  ###
  render: (res) ->
    if @embeddedWidget?
      @labelElement.html (@embeddedWidget.renderLabel res)
      @trigger "df:rendered", [res]

  ###*
   * Called when subsequent (not "first-page") responses for a specific search
   * are received. Disabled in this kind of widget.
   *
   * @param {Object} res Search response.
  ###
  renderNext: (res) ->

  ###*
   * Cleans the widget by removing the HTML inside the label element. Also, if
   * the panel starts hidden, it's hidden again. If the panel starts collapsed,
   * it's collapsed again.
   *
   * WARNING: DON'T CALL `super()` here. We don't want the panel container to
   * be reset!!!
   *
   * @fires FacetPanel#df:cleaned
  ###
  clean: ->
    @labelElement.html ""
    if @options.startHidden
      @element.css "display", "none"
    if @options.startCollapsed then @collapse() else @expand()
    @trigger "df:cleaned"


module.exports = FacetPanel
