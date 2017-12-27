extend = require "extend"
Widget = require "./widget"
Thing = require "../util/thing"


###*
 * Represents a search input. This widget gets the search terms and calls the
 * controller's search method. Certain minimum number of characters are needed
 * to trigger search but the value is configurable.
###
class QueryInput extends Widget

  ###*
   * @param  {String|Node|DfDomElement} element  The search input element.
   * @param  {Object} options Options object. Empty by default.
  ###
  constructor: (element, options = {}) ->
    defaults =
      clean: true
      captureLength: 3
      typingTimeout: 1000
      wait: 43

    super element, (extend true, defaults, options)

    @controller = []
    @timer = null
    @stopTimer = null

    Object.defineProperty @, "value",
      get: =>
        @element.val() or ""
      set: (value) =>
        @element.val value
        @scheduleUpdate()

    @previousValue = @value

  setController: (controller) ->
    if not Thing.is.array controller
      controller = [controller]
    @controller = @controller.concat controller

  ###*
   * Initializes the object with a controller and attachs event handlers for
   * this widget instance. A QueryInput widget can be used by more than one
   * controller (is an input widget, so it doesn't render results).
   *
   * @param  {Controller} controller Doofinder Search controller.
  ###
  init: ->
    unless @initialized
      @element.on "input", (=> @scheduleUpdate())

      unless (@element.get 0).tagName.toUpperCase() is "TEXTAREA"
        @element.on "keydown", (e) =>
          if e.keyCode? and e.keyCode is 13
            @scheduleUpdate 0, true
            @trigger "df:input:submit", [@value]

      super

  scheduleUpdate: (delay = @options.wait, force = false) ->
    clearTimeout @timer
    clearTimeout @stopTimer
    @timer = setTimeout (@updateStatus.bind @), delay, force

  updateStatus: (force) ->
    valueOk = @value.length >= @options.captureLength
    valueChanged = @value.toUpperCase() != @previousValue

    if valueOk and (valueChanged or force)
      @stopTimer = setTimeout (=>
        @trigger "df:input:stop", [@value]
        @trigger "df:typing_stopped", [@value] # DEPRECATED
      ), @options.typingTimeout
      @previousValue = @value.toUpperCase()
      @controller.forEach (controller) => controller.search @value

  ###*
   * If the widget is configured to be cleaned, empties the value of the input
   * element.
   * @fires Widget#df:widget:clean
  ###
  clean: ->
    if @options.clean
      @element.val ""  # don't use @value, we don't want to search on clean
    super


module.exports = QueryInput
