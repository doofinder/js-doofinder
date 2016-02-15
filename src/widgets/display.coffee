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
  constructor: (container, @template, options = {}) ->
    @container = container
    @mustache = require("mustache")
    @extraContext = options.templateVars
    @addHelpers = (context) ->
      addHelpers context, 
        options.urlParams, 
        options.currency, 
        options.translations, 
        options.templateFunctions
    
    super(container)

  ###
  render

  Replaces the older results in container with
  the given

  @param {Object} res
  @api public
  ###  
  render: (res) ->
    context = $.extend(true, res, @extraContext || {})
    @addHelpers context
    html = @mustache.render @template, context
    try
      $(@container).html html
      @trigger("df:rendered", [res])
    catch 
      throw Error "widget.Display: Error while rendering." + 
        " The container you are trying to access does not already exist."
    

  ###
  renderNext

  Replaces results to the older in container
  @param {Object} res
  @api public
  ###  
  renderNext: (res) ->
    @render(res)
    @trigger("df:rendered", [res])

  ###
  clean

  Cleans the container content.
  @api public
  ###
  clean: () ->
    $(@container).html ""

  ###
  addExtraContext

  Allows adding context dynamically.
  @param {String} key
  @param {Mixed} value
  @api public
  ###
  addExtraContext: (key, value) ->
    if @extraContext == undefined
      @extraContext = {}
    @extraContext[key] = value

  module.exports = Display