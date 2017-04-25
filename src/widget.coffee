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

  ###*
   * Attachs a single-use event listener to the container element.
   * @param  {String}   event    Event name.
   * @param  {Function} callback Function that will be executed in response to
   *                             the event.
  ###
  one: (event, callback) ->
    @element.one event, callback

  ###*
   * Attachs an event listener to the container element.
   * TODO(@carlosescri): Rename to "on" to unify.
   *
   * @param  {String}   event    Event name.
   * @param  {Function} callback Function that will be executed in response to
   *                             the event.
  ###
  bind: (event, callback) ->
    @element.on event, callback

  ###*
   * Removes an event listener from the container element.
   * @param  {String}   event    Event name.
   * @param  {Function} callback Function that won't be executed anymore in
   *                             response to the event.
  ###
  off: (event, callback) ->
    @element.off event, callback

  ###
  trigger

  Method to trigger an event
  @param {String} event
  @param {Array} params
  @api public
  ###
  ###*
   * Triggers an event with the container element as the target of the event.
   * @param  {String} event  Event name.
   * @param  {Array}  params Array of parameters to be sent to the handler.
  ###
  trigger: (event, params) ->
    @element.trigger event, params

  ###*
   * Throws an error that can be captured.
   * @param  {String} message Error message.
   * @throws {Error}
  ###
  raiseError: (message) ->
    throw Error "[Doofinder] #{message}"

module.exports = Widget
