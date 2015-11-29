###
queryinput.coffee
author: @ecoslado
2015 11 21
###

$ = require '../util/jquery'
Widget = require '../widget'

###
QueryInput

This class gets the query and
calls controller's search method.
Gets the string from an input when
receives more than three characters.
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
  
  ###
  start

  This is the function where bind the
  events to DOM elements.
  @api public
  ###
  start: () ->
    _this = this
    options = $.extend true,
      callback: () ->
        query = document.querySelector(_this.queryInput).value
        _this.controller.search(query)
      wait: 43
      captureLength: 3,
      @options

    $(@queryInput).typeWatch options

module.exports = QueryInput