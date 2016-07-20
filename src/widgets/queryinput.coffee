###
queryinput.coffee
author: @ecoslado
2015 11 21
###

extend = require 'extend'
Widget = require '../widget'
dfTypeWatch = require '../util/dftypewatch'

###
QueryInput

This class gets the query and
calls controller's search method.
Gets the string from an input when
receives more than given number of
characters (3 by default).
###

class QueryInput extends Widget

  ###
  constructor

  Just to set the queryInput

  @param {String} queryInput
  @param {Object} options
  @api public
  ###
  constructor: (element, @options = {}) ->
    super(element)
    @typingTimeout = @options.typingTimeout || 1000

  ###
  start

  This is the function where bind the
  events to DOM elements.
  @api public
  ###
  init: (controller) ->
    if @controller
      @controller.push controller
    else
      @controller = [controller]

    self = this

    options = extend true,
      callback: ->
        query = self.element.val()
        controller.reset()
        controller.search.call controller, query
      wait: 43
      captureLength: 3,
      @options

    dfTypeWatch @element, options
    controller = @controller[0]
    controller.bind 'df:results_received', (res) ->
      setTimeout (->
        if controller.status.params.query_counter == res.query_counter and
            controller.status.currentPage == 1
          self.trigger('df:typing_stopped')),
        self.typingTimeout



module.exports = QueryInput
