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
      wait: 42 # meaning of life

    super element, (extend true, defaults, options)

    @controller = []
    @timer = null
    @stopTimer = null

    Object.defineProperty @, "value",
      get: =>
        @element.val() or ""
      set: (value) =>
        @element.val value
        @__scheduleUpdate()

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
      @element.on "input", (=> @__scheduleUpdate())

      unless (@element.get 0).tagName.toUpperCase() is "TEXTAREA"
        @element.on "keydown", (e) =>
          if e.keyCode? and e.keyCode is 13
            @__scheduleUpdate 0, true
            @trigger "df:input:submit", [@value]

      super

  ###*
   * Schedules input validation so its done "in the future", giving the user
   * time to enter a new character (delaying search requests).
   *
   * @param  {Number} delay  = @options.wait  Time to wait until update in
   *                         milliseconds.
   * @param  {Boolean} force = false  Forces search if value is OK whether
   *                         value changed or not.
   * @protected
  ###
  __scheduleUpdate: (delay = @options.wait, force = false) ->
    clearTimeout @timer
    clearTimeout @stopTimer
    @timer = setTimeout (@__updateStatus.bind @), delay, force

  ###*
   * Checks current value of the input and, if it is OK and it changed since the
   * last check, performs a new search in each registered controller.
   *
   * @param  {Boolean} force = false If true forces search if value is OK
   *                         whether value changed or not.
   * @protected
  ###
  __updateStatus: (force = false) ->
    valueOk = @value.length >= @options.captureLength
    valueChanged = @value.toUpperCase() != @previousValue

    if valueOk and (valueChanged or force)
      @stopTimer = setTimeout (=>
        @trigger "df:input:stop", [@value]
      ), @options.typingTimeout
      @previousValue = @value.toUpperCase()
      @controller.forEach (controller) => controller.search @value
    else if @previousValue.length > 0 and @value.length is 0
      @trigger "df:input:none" if @value.length is 0

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
