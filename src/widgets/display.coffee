###
display.coffee
author: @ecoslado
2015 11 10
###

###
Display
This class receives the search
results and paint them in an element
shaped by template. Every new page
replaces the current content.
###

Widget = require '../widget'
addHelpers = require("../util/helpers").addHelpers
extend = require 'extend'

class Display extends Widget

  ###
  constructor

  @param {String} element
  @param {String|Function} template
  @param {Object} options
  @api public
  ###
  constructor: (element, @template, options = {}) ->
    @mustache = require("mustache")
    @extraContext = options.templateVars
    @addHelpers = (context) ->
      addHelpers context,
        options.urlParams,
        options.currency,
        options.translations,
        options.templateFunctions

    super(element)

  ###
  render

  Replaces the older results in element with
  the given

  @param {Object} res
  @api public
  ###
  render: (res) ->
    context = extend true, res, @extraContext or {}
    context.is_first = true
    @addHelpers context
    @element.innerHTML = @mustache.render @template, context
    @trigger("df:rendered", [res])



  ###
  renderNext

  Replaces old results with the new ones in the element
  @param {Object} res
  @api public
  ###
  renderNext: (res) ->
    context = extend true, res, @extraContext or {}
    context.is_first = false
    @addHelpers context
    @element.innerHTML = @mustache.render @template, context
    @trigger("df:rendered", [res])

  ###
  clean

  Cleans the element's content.
  @api public
  ###
  clean: () ->
    @element.innerHTML = ""

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
