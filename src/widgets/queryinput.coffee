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
  constructor: (element, options = {}) ->
    super element, options
    @typingTimeout = @options.typingTimeout || 1000
    @eventsBound = false
    @cleanInput = if @options.clean? then @options.clean else true # TODO: docs!!!

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

  clean: () ->
    if @cleanInput
      @element.val('')

module.exports = QueryInput
