bean = require "bean"
$ = require "../util/dfdom"


###*
 * Base class for a Widget, a class that paints itself given a search response.
###
class Widget

  ###*
   * @param  {(String|Node|DfDomElement)} element
   * @param  {Object}                     [options = {}]
  ###
  constructor: (element, @options = {}) ->
    @initialized = false
    @controller = null
    @setElement element

  ###*
   * Assigns the container element to the widget.
   *
   * 99.9% of times this method is used "as is" but can be customized to assign
   * a different container element to the widget.
   *
   * @param  {String|Node|DfDomElement} element   Container node.
  ###
  setElement: (element) ->
    @element = ($ element).first()

  ###*
   * Assigns a controller to the widget so the widget can get access to the
   * status of the search.
   *
   * @param {Controller} controller
  ###
  setController: (@controller) ->

  ###*
   * Initializes the object. Intended to be extended in child classes, this
   * method should be executed only once. This is enforced by the `initialized`
   * attribute.
   *
   * You will want to add your own event handlers here.
  ###
  init: ->
    unless @initialized
      @initialized = true
      @trigger "df:widget:init"

  ###*
   * Renders the widget with the search response received from the server.
   *
   * @param  {Object} res Search response.
  ###
  render: (res) ->
    @trigger "df:widget:render", [res]
    @trigger "df:rendered", [res] # DEPRECATED

  ###*
   * Cleans the widget. Intended to be overriden.
  ###
  clean: ->
    @trigger "df:widget:clean"
    @trigger "df:cleaned" # DEPRECATED

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
