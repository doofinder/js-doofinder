###
queryinput.coffee
author: @ecoslado
2015 11 21
###

extend = require '../util/extend'
Widget = require '../widget'
dfTypeWatch = require '../util/dfTypeWatch'

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
  constructor: (@queryInput, @options = {}) ->
  	super(@queryInput)
  
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

    _this = this
    options = extend true,
      callback: () ->
        query = document.querySelector(_this.queryInput).value
        controller.reset()
        controller.search.call(controller, query)
      wait: 43
      captureLength: 3,
      @options

    dfTypeWatch @queryInput, options

module.exports = QueryInput