merge = require "../util/merge"
Widget = require "./widget"

helpers = require "../util/helpers"


###*
 * Widget that renders a search response within a given template.
###
class Display extends Widget
  @defaultTemplate = """
    {{#results}}
      <a href="{{link}}" class="df-card">{{title}}</a>
    {{/results}}
  """
  ###*
   * @param  {(String|Node|DfDomElement)} element  Container node.
   * @param  {Object}                     options  Options for the widget.
  ###
  constructor: (element, options = {}) ->
    defaults =
      template: @constructor.defaultTemplate
      templateFunctions: {}
      templateVars: {}
      translations: {}

    options = merge defaults, options

    super element, options

    helpers.addTranslateHelper @options.templateFunctions, @options.translations

    @mustache = require "mustache"
    @currentContext = {}

  ###*
   * Adds extra context to the passed context object.
   * @param  {Object} response = {} Search response as initial context.
   * @return {Object}               Extended search response.
   * @protected
  ###
  __buildContext: (response = {}) ->
    @currentContext = merge {},
                            response,
                            @options.templateVars,
                            @options.templateFunctions,
                            is_first: response.page is 1
                            is_last: response.page is Math.ceil (response.total / response.results_per_page)

  ###*
   * Actually renders the template given a search response.
   * @param  {Object} res Search response.
   * @return {String}     The rendered HTML code.
   * @protected
  ###
  __renderTemplate: (res) ->
    @mustache.render @options.template, @__buildContext res

  ###*
   * Called when the "first page" response for a specific search is received.
   * Renders the widget with the data received, by replacing its content.
   *
   * @param {Object} res Search response.
   * @fires Widget#df:widget:render
  ###
  render: (res) ->
    @element.html @__renderTemplate res
    super

  ###*
   * Cleans the widget by removing all the HTML inside the container element.
   * @fires Widget#df:widget:clean
  ###
  clean: ->
    @element.html ""
    super


module.exports = Display
