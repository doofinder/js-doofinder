extend = require "extend"
Widget = require "../widget"
dfTypeWatch = require "../util/dftypewatch"


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
    super element, options
    @typingTimeout = @options.typingTimeout || 1000
    @eventsBound = false
    @cleanInput = if @options.clean? then @options.clean else true

  ###*
   * Initializes the object with a controller and attachs event handlers for
   * this widget instance. A QueryInput widget can be used by more than one
   * controller (is an input widget, so it doesn't render results).
   *
   * TODO(@carlosescri): Seems that is not clear how the assignment works and
   * only the first controller is being notified when the user stops typing...
   *
   * @param  {Controller} controller Doofinder Search controller.
  ###
  init: (controller) ->
    if @controller
      @controller.push controller
    else
      @controller = [controller]

    self = this

    # Bind events only once
    if not @eventsBound
      options = extend true,
        callback: ->
          query = self.element.val()
          self.controller.forEach (controller)->
            controller.reset()
            controller.search.call controller, query
        wait: 43
        captureLength: 3,
        @options
      dfTypeWatch @element, options

      # Typing stopped event
      # WTF(@carlosescri): Why we declare @controller as an array and then use
      # only the first one?
      ctrl = @controller[0]
      ctrl.bind 'df:results_received', (res) ->
        setTimeout (->
          if ctrl.status.params.query_counter == res.query_counter and
              ctrl.status.currentPage == 1
            self.trigger('df:typing_stopped', [ctrl.status.params.query])),
          self.typingTimeout

      @eventsBound = true

  ###*
   * If the widget is configured to be cleaned, empties the value of the input
   * element.
   * @fires QueryInput#df:cleaned
  ###
  clean: ->
    if @cleanInput
      @element.val('')
      @trigger "df:cleaned"


module.exports = QueryInput
