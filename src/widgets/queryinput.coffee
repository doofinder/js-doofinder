Widget = require "./widget"
Thing = require "../util/thing"
merge = require "../util/merge"
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
      typingTimeout: 1000
      wait: 42 # meaning of life
      delayedEvents: null

    super element, (merge defaults, options)

    @controller = []
    @currentElement = @element.first()
    @timer = null
    @activeEventTimers = {}
    @delayedEvents = merge {}, @options.delayedEvents or {}

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
    @element = ($ element).filter [
      'input:not([type])',
      'input[type="text"]',
      'input[type="search"]',
      'textarea'
    ].join ","

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

      @registerDelayedEvent "df:input:stop", @options.typingTimeout

      super


  ###*
   * Register a new event with the specified name that is dispatched when the
   * user stop typing during the number of miliseconds defined by delay param.
   * If eventName exits, the delay assigned is update.
   *
   * @param {String} eventName  Name of the event
   * @param {Number} delay      Time in miliseconds that the event waits after
   *                            the user stops typing to be dispatched.
  ###
  registerDelayedEvent: (eventName, delay) =>
    @delayedEvents[eventName] = delay


  ###*
   * Unregister the delayed event with the given name.
   *
   * @param {String}  eventName Name of the event will be unregistered.
  ###
  unregisterDelayedEvent: (eventName) =>
    @__cancelDelayedEvent eventName
    delete @delayedEvents[eventName]


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
    @__cancelDelayedEvents()
    @timer = setTimeout (@__updateStatus.bind @), delay, force


  ###*
   * Schedules all declared events to be dispatched after the configured time.
  ###
  __scheduleDelayedEvents: ->
    for eventName, delay of @delayedEvents
      @__scheduleDelayedEvent eventName, delay

  ###*
   * Schedules an event that will be dispatched after the given delay in ms.
   *
   * @param {String}  eventName
   * @param {Number}  delay
  ###
  __scheduleDelayedEvent: (eventName, delay) ->
    @activeEventTimers[eventName] = setTimeout (=>
      @trigger eventName, [@value]
    ), delay

  ###*
   * Cancels all scheduled events.
  ###
  __cancelDelayedEvents: ->
    for eventName in Object.keys @delayedEvents
      @__cancelDelayedEvent eventName

  ###*
   * Schedules an event that will be dispatched after the given delay in ms.
   *
   * @param {String}  eventName
   * @param {Number}  delay
  ###
  __cancelDelayedEvent: (eventName) ->
    clearTimeout @activeEventTimers[eventName]
    delete @activeEventTimers[eventName]


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

    @previousValue = @value.toUpperCase()

    if valueOk and (valueChanged or force)
      @__scheduleDelayedEvents()
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
