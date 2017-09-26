extend = require "extend"
Display = require "../display"
$ = require "../../util/dfdom"

defaultTemplate = """
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

defaultButtonTemplate = """
  <button type="button" data-toggle-extra-content
      data-text-normal="{{#translate}}{{viewMoreLabel}}{{/translate}}"
      data-text-toggle="{{#translate}}{{viewLessLabel}}{{/translate}}">
    {{#translate}}
      {{#collapsed}}{{viewMoreLabel}}{{/collapsed}}
      {{^collapsed}}{{viewLessLabel}}{{/collapsed}}
    {{/translate}}
  </button>
"""


###*
 * Represents a terms selector control to filter by the possible values of a
 * text field.
###
class TermsFacet extends Display
  ###*
   * @param  {String|Node|DfDomElement} element  Container node.
   * @param  {String} facet    Name of the facet/filter.
   * @param  {Object} options Options object. Empty by default.
  ###
  constructor: (element, @facet, options = {}) ->
    defaults =
      size: null  # set an int value to enable extra content behavior
      template: defaultTemplate
      buttonTemplate: defaultButtonTemplate
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
              context = extend true, collapsed: @collapsed, @currentContext
              @mustache.render @options.buttonTemplate, context
            else
              ""

    super element, (extend true, defaults, options)

    @collapsed = @options.size?

  ###*
   * Initializes the object with a controller and attachs event handlers for
   * this widget instance.
   *
   * @param  {Controller} controller Doofinder Search controller.
  ###
  init: ->
    unless @initialized
      # Handle clicks on terms by event delegation.
      @element.on "click", "[data-facet='#{@facet}'][data-value]", (e) =>
        e.preventDefault()

        termNode = ($ e.currentTarget)
        facetName = termNode.data "facet"
        facetValue = termNode.data "value"
        isSelected = not termNode.hasAttr "data-selected"

        # TODO(@carlosescri): Probably all this controller stuff shouldn't be
        # here and the controller should know this is a Filter Widget and
        # listen for changes to refresh itself.

        if isSelected
          termNode.attr "data-selected", ""
          @controller.addFilter facetName, facetValue
        else
          termNode.removeAttr "data-selected"
          @controller.removeFilter facetName, facetValue

        @controller.refresh()
        @trigger "df:term:click", [facetName, facetValue, isSelected]

        # TODO(@carlosescri)'s proposal:
        # if isSelected
        #   termNode.attr "data-selected", ""
        #   @trigger "df:filter:add", [facetName, facetValue]
        # else
        #   termNode.removeAttr "data-selected"
        #   @trigger "df:filter:remove", [facetName]

        # @trigger "df:term:click", [facetName, facetValue, isSelected]

      if @options.size?
        @element.on "click", "[data-toggle-extra-content]", (e) =>
          e.preventDefault()
          @toggleExtraContent()

    super

  toggleExtraContent: ->
    if @collapsed
      labelAttr = "data-text-toggle"
      @element.attr "data-view-extra-content", ""
    else
      labelAttr = "data-text-normal"
      @element.removeAttr "data-view-extra-content"

    btn = @getButton()
    (btn.get 0).textContent = (btn.attr labelAttr).trim()
    @collapsed = not @collapsed
    @trigger "df:collapse:change", [@collapsed]

  ###*
   * @return {HTMLElement} The "show more" button.
  ###
  getButton: ->
    (@element.find "[data-toggle-extra-content]").first()

  getSelectedTerms: (res) ->
    (res?.filter?.terms?[@facet]) or []

  ###*
   * @param  {Object} res Results response from the server.
   * @return {Number}     Total terms used for filter.
  ###
  countSelectedTerms: (res) ->
    (@getSelectedTerms res).length

  ###*
   * Called when the "first page" response for a specific search is received.
   * Renders the widget with the data received, by replacing its content.
   *
   * @param {Object} res Search response.
   * @fires TermsFacet#df:widget:render
  ###
  render: (res) ->
    if res.page is 1
      terms = res.facets[@facet].terms.buckets

      if terms.length > 0
        selected = @getSelectedTerms res
        for index, term of terms
          term.index = parseInt index, 10
          term.name = @facet
          term.selected = term.key in selected

        context =
          name: @facet
          terms: terms
          size: @options.size

        super (extend true, {}, res, context)
      else
        @clean()
    else
      false

module.exports = TermsFacet
