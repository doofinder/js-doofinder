extend = require "extend"
TermsFacet = require "./termsfacet"
$ = require "../../util/dfdom"

###*
 * Represents a terms selector control to filter by the possible values of a
 * text field.
###
class CollapsibleTermsFacet extends TermsFacet
  @defaultTemplate = """
    {{#terms}}
      <div class="df-term" data-facet="{{name}}" data-value="{{key}}"
          {{#extra-content}}{{index}}{{/extra-content}}
          {{#selected}}data-selected{{/selected}}>
        <span class="df-term__value">{{key}}</span>
        <span class="df-term__count">{{doc_count}}</span>
      </div>
    {{/terms}}
    {{#show-more-button}}{{terms.length}}{{/show-more-button}}
  """
  @defaultButtonTemplate = """
    <button type="button" data-toggle-extra-content
        data-text-normal="{{#translate}}{{viewMoreLabel}}{{/translate}}"
        data-text-toggle="{{#translate}}{{viewLessLabel}}{{/translate}}">
      {{#collapsed}}{{#translate}}{{viewMoreLabel}}{{/translate}}{{/collapsed}}
      {{^collapsed}}{{#translate}}{{viewLessLabel}}{{/translate}}{{/collapsed}}
    </button>
  """
  ###*
   * @param  {String|Node|DfDomElement} element  Container node.
   * @param  {String} facet Name of the facet/filter.
   * @param  {Object} options
  ###
  constructor: (element, facet, options = {}) ->
    defaults =
      size: 10
      startCollapsed: true
      buttonTemplate: @constructor.defaultButtonTemplate
      templateVars:
        viewMoreLabel: "View more…"
        viewLessLabel: "View less…"
      templateFunctions:
        "extra-content": =>
          ###*
           * Returns `data-extra-content` if the (0-based) index is greater
           * than or equal to the size passed.
           *
           * Index and size are passed as text and must be parsed:
           *
           * {{#extra-content}}{{index}}:{{size}}{{/extra-content}}
           *
           * @param  {string}   text
           * @param  {Function} render
           * @return {string}   "data-extra-content" or ""
          ###
          (text, render) =>
            i = parseInt (render text), 10
            if @options.size? and i >= @options.size then "data-extra-content" else ""

        "show-more-button": =>
          ###*
           * Renders a `View More` button if the length is greater than the
           * size passed.
           *
           * {{#show-more-button}}{{length}}:{{size}}{{/show-more-button}}
           *
           * @param  {string}   text
           * @param  {Function} render
           * @return {string}   Rendered button or "".
          ###
          return (text, render) =>
            len = parseInt (render text), 10
            if @options.size? and len > @options.size
              @mustache.render @options.buttonTemplate, @currentContext
            else
              ""

    super element, facet, (extend true, defaults, options)

    Object.defineProperty @, 'isCollapsed', get: =>
      not @element.hasAttr "data-view-extra-content"

    @totalSelected = 0

  ###*
   * Initializes the object with a controller and attachs event handlers for
   * this widget instance.
   *
   * @param  {Controller} controller Doofinder Search controller.
  ###
  init: ->
    unless @initialized
      @__updateElement @options.startCollapsed

      @element.on "click", "[data-toggle-extra-content]", (e) =>
        e.preventDefault()
        @toggle()
    super

  ###*
   * @return {HTMLElement} The "show more" button.
  ###
  __getButton: ->
    (@element.find "[data-toggle-extra-content]").first()

  __updateButton: (collapsed) ->
    btn = @__getButton()
    att = if collapsed then "data-text-normal" else "data-text-toggle"
    (btn.get 0).textContent = (btn.attr att).trim()

  __updateElement: (collapsed) ->
    if collapsed
      @element.removeAttr "data-view-extra-content"
    else
      @element.attr "data-view-extra-content", ""

  collapse: ->
    unless @isCollapsed
      @__updateButton true
      @__updateElement true
      @trigger "df:collapse:change", [true]

  expand: ->
    if @isCollapsed
      @__updateButton false
      @__updateElement false
      @trigger "df:collapse:change", [false]

  toggle: ->
    if @isCollapsed then @expand() else @collapse()

  reset: ->
    if @options.startCollapsed then @collapse() else @expand()

  ###*
   * Adds extra context to the passed context object.
   *
   * @param  {Object} response = {} Search response as initial context.
   * @return {Object}               Extended search response.
   * @protected
  ###
  __buildContext: (response = {}) ->
    super
    @currentContext = extend true, @currentContext, size: @options.size, collapsed: @isCollapsed

  clean: ->
    @reset()
    super

module.exports = CollapsibleTermsFacet
