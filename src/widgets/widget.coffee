bean = require "bean"
$ = require "../util/dfdom"


###*
 * Base class for a Widget, a class that paints itself given a search response.
 *
 * A widget knows how to:
 *
 * - Render and clean itself.
 * - Bind handlers to/trigger events on the main element node.
###
class Widget

  ###*
   * @param  {String|Node|DfDomElement} element   Container node.
   * @param  {Object} @options = {}               Options for the widget.
  ###
  constructor: (element, @options = {}) ->
    @setElement element
    @controller = null
    @initialized = false

  ###*
   * Assigns the container element to the widget.
   * @param  {String|Node|DfDomElement} element   Container node.
  ###
  setElement: (element) ->
    @element = ($ element).first()

  setController: (@controller) ->

  ###*
   * Initializes the object. Intended to be extended in child classes.
   * You will want to add your own event handlers here.
   *
   * @param  {Controller} controller Doofinder Search controller.
  ###
  init: ->
    @initialized = true
    @trigger "df:widget:init"

  ###*
   * Called when the "first page" response for a specific search is received.
   * Renders the widget with the data received.
   *
   * @param  {Object} res Search response.
  ###
  render: (res) ->
    @trigger "df:widget:render", [res]

  ###*
   * Cleans the widget. Intended to be overriden.
  ###
  clean: ->
    @trigger "df:widget:clean"

  #
  # Events
  #

  on: (eventName, handler) ->
    bean.on @, eventName, handler

  one: (eventName, handler) ->
    bean.one @, eventName, handler

  off: (eventName, handler) ->
    bean.off @, eventName, handler

  trigger: (eventName, args) ->
    bean.fire @, eventName, args


module.exports = Widget
