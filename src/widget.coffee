###
widget.coffee
author: @ecoslado
2015 11 10
###

###
Widget
This class receives the search
results and paint them in a container
shaped by template
###

Emitter = require 'tiny-emitter' 

class Widget

  
  constructor: () ->
  	@emitter = new Emitter

  ###
  init

  This is the function where bind the
  events to DOM elements. In Widget
  is dummy. To be overriden.
  ###
  init: (controller) ->
    @controller = controller
      
  ###
  render

  This function will be called when search and
  getPage function si called in controller.
  In Widget is dummy. To be overriden.

  @param {Object} res
  @api public
  ###  
  render: (res) ->

  ###
  renderMore

  This function will be called when nextPage
  function si called in controller.
  In Widget is dummy. To be overriden.
  @param {Object} res
  @api public
  ###  
  renderNext: (res) ->
    
  ###
  bind

  Method to add and event listener
  @param {String} event
  @param {Function} callback
  @api public
  ###
  bind: (event, callback) ->
    @emitter.on(event, callback)

  ###
  trigger

  Method to trigger an event
  @param {String} event
  @param {Array} params
  @api public
  ###
  trigger: (event, params) -> 
    @emitter.emit(event, params)

module.exports = Widget
