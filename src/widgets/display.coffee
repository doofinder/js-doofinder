###
display.coffee
author: @ecoslado
2015 11 10
###

###
Display
This class receives the search
results and paint them in a container
shaped by template. Every new page
replaces the current content.
###

Widget = require '../widget'
addHelpers = require("../util/helpers").addHelpers

$ = require("../util/jquery")

class Display extends Widget

  ###
  constructor

  @param {String} container
  @param {String|Function} template
  @param {Object} options 
  @api public
  ###
  constructor: (container, template, options = {}) ->
    @container = container
    @handlebars = require("handlebars")
    @extraContext = options.extraContext
    addHelpers @handlebars, 
      options.urlParams, 
      options.currency, 
      options.translations, 
      options.helpers
    
    if template.constructor == String
      @template = @handlebars.compile(template)
    
    else if template instanceof Function
      @template = template
    
    else
      throw Error "The provided template is not the right type." +
        " String or rendered handlebars expected."

  ###
  render

  Replaces the older results in container with
  the given

  @param {Object} res
  @api public
  ###  
  render: (res) ->
    html = @template res
    try
      $(@container).html html
    catch 
      throw Error "widget.Results: Error while rendering." + 
        " The container you are trying to access does not already exist."
    
    

  ###
  renderNext

  Replaces results to the older in container
  @param {Object} res
  @api public
  ###  
  renderNext: (res) ->
    @render(res)

  module.exports = Display