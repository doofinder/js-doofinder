extend = require "extend"
Widget = require "./widget"
addHelpers = require "../util/helpers"


defaultTemplate = """
  {{#results}}
    <a href="{{link}}" class="df-card">{{title}}</a>
  {{/results}}
"""


###*
 * Widget that renders a search response within a given template.
###
class Display extends Widget
  ###*
   * @param  {String|Node|DfDomElement} element  Container node.
   * @param  {String}                   template Template to paint the response.
   * @param  {Objects}                  options  Options for the widget.
  ###
  constructor: (element, options = {}) ->
    defaults =
      template: defaultTemplate
      queryParam: undefined
      urlParams: {}
    options = extend true, defaults, options

    super element, options

    @mustache = require "mustache"
    @currentContext = {}

  ###*
   * Adds extra context to the passed context object.
   * @param  {Object} context = {}  Initial context (i.e: a search response).
   * @return {Object}               Extended context.
  ###
  buildContext: (res = {}) ->
    defaults =
      query: ""
      urlParams: @options.urlParams

    overrides =
      is_first: res.page is 1
      is_last: res.page is Math.ceil (res.total / res.results_per_page)
      currency: @options.currency
      translations: @options.translations

    context = extend true,
      {},
      defaults,
      res,
      @options.templateVars,
      @options.templateFunctions,
      overrides

    if @options.queryParam
      context.urlParams[@options.queryParam] = context.query

    @currentContext = addHelpers context

  renderTemplate: (res) ->
    @mustache.render @options.template, @buildContext res

  ###*
   * Called when the "first page" response for a specific search is received.
   * Renders the widget with the data received, by replacing its content.
   *
   * @param {Object} res Search response.
   * @fires Display#df:widget:render
  ###
  render: (res) ->
    @element.html @renderTemplate res
    super

  ###*
   * Cleans the widget by removing all the HTML inside the container element.
   * @fires Display#df:widget:clean
  ###
  clean: ->
    @element.html ""
    super


module.exports = Display
