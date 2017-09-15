bean = require "bean"
$ = require "./util/dfdom"


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

  ###*
   * Assigns the container element to the widget.
   * @param  {String|Node|DfDomElement} element   Container node.
  ###
  setElement: (element) ->
    @element = ($ element).first()

  ###*
   * Initializes the object. Intended to be extended in child classes.
   * You will want to add your own event handlers here.
   *
   * @param  {Controller} controller Doofinder Search controller.
  ###
  init: (@controller) ->

  ###*
   * Called when the "first page" response for a specific search is received.
   * Renders the widget with the data received.
   *
   * @param  {Object} res Search response.
  ###
  render: (res) ->

  ###*
   * Called when subsequent (not "first-page") responses for a specific search
   * are received. Renders the widget with the data received.
   *
   * @param  {Object} res Search response.
  ###
  renderNext: (res) ->

  ###*
   * Cleans the widget. Intended to be overriden.
  ###
  clean: ->


  #
  # Events
  #

  on: (eventName, handler, args = []) ->
    @element.on eventName, handler, args

  one: (eventName, handler, args = []) ->
    @element.one eventName, handler, args

  off: (eventName, handler) ->
    @element.off eventName, handler

  trigger: (eventName, args = []) ->
    @element.trigger eventName, args

  ###*
   * Throws an error that can be captured.
   * @param  {String} message Error message.
   * @throws {Error}
  ###
  raiseError: (message) ->
    throw Error "[Doofinder] #{message}"

module.exports = Widget
