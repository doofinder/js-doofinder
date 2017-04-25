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
    @mustache = require "mustache"
    @extraContext = options.templateVars
    super element, options

  addHelpers: (res) ->
    context = addHelpers (extend true, res, @extraContext),
      @options.urlParams,
      @options.currency,
      @options.translations,
      @options.templateFunctions
    extend true, context, is_first: res.page == 1, is_last: @controller?.status?.lastPageReached

  ###
  render

  Replaces the older results in element with
  the given

  @param {Object} res
  @api public
  ###
  render: (res) ->
    @element.html (@mustache.render @template, @addHelpers res)
    @trigger "df:rendered", [res]



  ###
  renderNext

  Replaces old results with the new ones in the element
  @param {Object} res
  @api public
  ###
  renderNext: (res) ->
    @element.html (@mustache.render @template, @addHelpers res)
    @trigger "df:rendered", [res]

  ###
  clean

  Cleans the element's content.
  @api public
  ###
  clean: ->
    @element.html ""
    @trigger "df:cleaned"

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
