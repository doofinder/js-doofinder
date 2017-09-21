Widget = require "./widget"
buildHelpers = require "../util/helpers"
extend = require "extend"

defaultTemplate = "{{#results}}<div>{{title}}</div>{{/results}}"


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
    options = extend true, template: defaultTemplate, options

    super element, options

    @mustache = require "mustache"
    # TODO(@carlosescri): Remove @extraContext and use @options.templateVars!!!
    @extraContext = {}

  ###*
   * Adds extra context to the passed context object.
   * @param  {Object} context = {}  Initial context (i.e: a search response).
   * @return {Object}               Extended context.
  ###
  buildContext: (context = {}) ->
    context = extend true,
      context,
      @options.templateVars,
      @options.templateFunctions,
      (is_first: context.page == 1, is_last: @controller?.status?.lastPageReached),
      @extraContext

    # Compose URL parameters from options and from the query (if configured)
    urlParams = extend true, {}, (@options.urlParams or {})
    if @options.queryParam
      urlParams[@options.queryParam] = context.query or ""

    buildHelpers context, urlParams, @options.currency, @options.translations

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
    @trigger "df:widget:clean"

  ###*
   * Adds extra context to be used when rendering a search response.
   * @param {String} key   Name of the variable to be used in the template.
   * @param {*}      value Value of the variable.
  ###
  addExtraContext: (key, value) ->
    @extraContext[key] = value


module.exports = Display
