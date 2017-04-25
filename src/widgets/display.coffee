Widget = require "../widget"
addHelpers = (require "../util/helpers").addHelpers
extend = require "extend"


###*
 * Widget that renders a search response within a given template.
###
class Display extends Widget

  ###*
   * @param  {String|Node|DfDomElement} element  Container node.
   * @param  {String}                   template Template to paint the response.
   * @param  {Objects}                  options  Options for the widget.
  ###
  constructor: (element, @template, options = {}) ->
    @mustache = require "mustache"
    # TODO(@carlosescri): Remove @extraContext and use @options.templateVars!!!
    @extraContext = options.templateVars or {}
    super element, options

  ###*
   * Adds more context to the search response.
   *
   * Adds:
   *
   * - extraContent (templateVars passed in the options or added later)
   * - Extra parameters to add to the results links.
   * - Currency options.
   * - Translations.
   * - Template Functions.
   * - is_first: Indicates if this is a "first page" response.
   * - is_last: Indicates if there's no next page for this search.
   *
   * @param  {Object} res Search response.
   * @return {Object} Extended response.
  ###
  addHelpers: (res = {}) ->
    context = addHelpers (extend true, res, @extraContext),
      @options.urlParams,
      @options.currency,
      @options.translations,
      @options.templateFunctions
    extend true, context, is_first: res.page == 1, is_last: @controller?.status?.lastPageReached

  ###*
   * Called when the "first page" response for a specific search is received.
   * Renders the widget with the data received, by replacing its content.
   *
   * @param {Object} res Search response.
   * @fires Display#df:rendered
  ###
  render: (res) ->
    @element.html (@mustache.render @template, @addHelpers res)
    @trigger "df:rendered", [res]

  ###*
   * Called when subsequent (not "first-page") responses for a specific search
   * are received. Renders the widget with the data received, by replacing its
   * content.
   *
   * @param {Object} res Search response.
   * @fires Display#df:rendered
  ###
  renderNext: (res) ->
    @element.html (@mustache.render @template, @addHelpers res)
    @trigger "df:rendered", [res]

  ###*
   * Cleans the widget by removing all the HTML inside the container element.
   * @fires Display#df:cleaned
  ###
  clean: ->
    @element.html ""
    @trigger "df:cleaned"

  ###*
   * Adds extra context to be used when rendering a search response.
   * @param {String} key   Name of the variable to be used in the template.
   * @param {*}      value Value of the variable.
  ###
  addExtraContext: (key, value) ->
    if @extraContext == undefined
      @extraContext = {}
    @extraContext[key] = value


module.exports = Display
