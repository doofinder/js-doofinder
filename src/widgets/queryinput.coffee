extend = require "extend"
Widget = require "./widget"


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
    @currentValue = @element.val() or ""

  setController: (controller) ->
    @controller.push controller

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
            @trigger "df:input:submit", [@element.val() or ""]

      super

  scheduleUpdate: (delay, force) ->
    clearTimeout @timer
    clearTimeout @stopTimer

    query = @element.val() or ""
    delay ?= @options.wait
    force ?= false

    @timer = setTimeout (@updateStatus.bind @), delay, query, force # IE10+

  updateStatus: (query, force) ->
    valid = query.length >= @options.captureLength
    changed = query.toUpperCase() != @currentValue
    if (valid and (changed or force)) or (@currentValue and not query.length)
      @stopTimer = setTimeout (@trigger.bind @), @options.typingTimeout, "df:input:stop", [query] # IE10+
      # @stopTimer = setTimeout (=> @trigger "df:input:stop", [query]), @options.typingTimeout
      @currentValue = query.toUpperCase()
      @controller.forEach (controller) -> controller.search query

  ###*
   * If the widget is configured to be cleaned, empties the value of the input
   * element.
   * @fires QueryInput#df:widget:clean
  ###
  clean: ->
    if @options.clean
      @element.val ""
      @trigger "df:widget:clean"


module.exports = QueryInput
