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
    @eventsBound = false
    @clean_input = false || options.clean

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

    # Bind events only once
    if not @eventsBound
      options = extend true,
        callback: ->
          query = self.element.val()
          self.controller.forEach (item)->
            item.reset()
            item.search.call item, query
        wait: 43
        captureLength: 3,
        @options
      dfTypeWatch @element, options
      
      # Typing stopped event
      ctrl = @controller[0]
      ctrl.bind 'df:results_received', (res) ->
        setTimeout (->
          if ctrl.status.params.query_counter == res.query_counter and
              ctrl.status.currentPage == 1
            self.trigger('df:typing_stopped', [ctrl.status.params.query])),
          self.typingTimeout

      @eventsBound = true

  clean: () ->
    if @clean_input
      @element.val('')

module.exports = QueryInput
