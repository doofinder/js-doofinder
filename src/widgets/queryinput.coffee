extend = require "extend"
Widget = require "./widget"
Thing = require "../util/thing"
errors = require "../util/errors"
$ = require "../util/dfdom"


###*
 * Represents a search input. This widget gets the search terms and calls the
 * controller's search method. Certain minimum number of characters are needed
 * to trigger search but the value is configurable.
###
class QueryInput extends Widget

  ###*
   * @param  {String|Array} element  The search input element as css selector or
                                      Array with String|Node|DfDomElement
                                      elements.
   * @param  {Object} options Options object. Empty by default.
  ###
  constructor: (element, options = {}) ->
    defaults =
      clean: true
      captureLength: 3
      captureForm: false
      typingTimeout: 1000
      wait: 42 # meaning of life

    super element, (extend true, defaults, options)

    @controller = []
    @currentElement = @element.first()
    @timer = null
    @stopTimer = null

    Object.defineProperty @, "value",
      get: =>
        @currentElement.val() or ""
      set: (value) =>
        @currentElement.val value
        # trigger on the current element so, if it also belongs to a different
        # widget, it gets notified too
        @currentElement.trigger "df:input:valueChanged"

    @previousValue = @value

  setController: (controller) ->
    if not Thing.is.array controller
      controller = [controller]
    @controller = @controller.concat controller

  setElement: (element) ->
    @element = ($ element).filter 'input[type="text"], input[type="search"], textarea'

  ###*
   * Sets the input element considered as the currently active one.
   *
   * If the provided element is the current active element nothing happens.
   * Otherwise a "df:input:targetChanged" event is triggered.
   *
   * TODO: This should validate that the current element belongs to
   * this.element.
   *
   * @param {HTMLElement} element Input node.
   * @protected
  ###
  __setCurrentElement: (element) ->
    if @currentElement.isnt element
      previousElement = @currentElement.get 0
      @trigger "df:input:targetChanged", [element, previousElement]
      @currentElement = $ element

  ###*
   * Initializes the object with a controller and attachs event handlers for
   * this widget instance. A QueryInput widget can be used by more than one
   * controller (is an input widget, so it doesn't render results).
   *
   * @param  {Controller} controller Doofinder Search controller.
  ###
  init: ->
    unless @initialized
      @element.on "focus", (event) =>
        @__setCurrentElement event.target

      @element.on "input", (event) =>
        @__setCurrentElement event.target
        # @element.val @value # Synchronize text inputs???
        @__scheduleUpdate()

      @element.on "df:input:valueChanged", =>
        @__updateStatus true

      # configure ENTER key capture

      # 1. get only input elements
      inputsOnly = @element.filter(":not(textarea)")

      # 2. if the user wants to capture the form submission, prevent it
      if @options.captureForm
        (inputsOnly.closest "form").on "submit", (event) ->
          event.preventDefault()

      # 3. capture the ENTER key
      inputsOnly.on "keydown", (event) =>
        if event.keyCode is 13
          @__scheduleUpdate 0, true
          # find the form closest to the input
          form = (($ event.target).closest "form").get 0
          @trigger "df:input:submit", [@value, form]

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
