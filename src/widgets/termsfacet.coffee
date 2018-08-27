Display = require "./display"
$ = require "../util/dfdom"
merge = require "../util/merge"

###*
 * Represents a terms selector control to filter by the possible values of a
 * text field.
###
class TermsFacet extends Display
  @defaultTemplate = """
    {{#terms}}
      <div class="df-term" data-facet="{{name}}" data-value="{{key}}"
          {{#selected}}data-selected{{/selected}}>
        <span class="df-term__value">{{key}}</span>
        <span class="df-term__count">{{doc_count}}</span>
      </div>
    {{/terms}}
  """
  ###*
   * @param  {String|Node|DfDomElement} element  Container node.
   * @param  {String} facet Name of the facet/filter.
   * @param  {Object} options
  ###
  constructor: (element, @facet, options = {}) ->
    super element, (merge template: @constructor.defaultTemplate, options)
    @totalSelected = 0

  ###*
   * Initializes the object with a controller and attachs event handlers for
   * this widget instance.
   *
   * @param  {Controller} controller Doofinder Search controller.
  ###
  init: ->
    unless @initialized
      # Handle clicks on terms by event delegation.
      @element.on "click", "[data-facet=\"#{@facet}\"][data-value]", (e) =>
        e.preventDefault()

        termNode = ($ e.currentTarget)
        facetName = termNode.data "facet"
        facetValue = termNode.data "value"
        isSelected = not termNode.hasAttr "data-selected"

        # TODO(@carlosescri): Probably all this controller stuff shouldn't be
        # here and the controller should know this is a Filter Widget and
        # listen for changes to refresh itself.

        if isSelected
          @totalSelected++
          termNode.attr "data-selected", ""
          @controller.addFilter facetName, facetValue
        else
          @totalSelected--
          termNode.removeAttr "data-selected"
          @controller.removeFilter facetName, facetValue

        @controller.refresh()
        @trigger "df:term:click", [facetName, facetValue, isSelected]

    super

  ###*
   * Adds extra context to the passed context object.
   *
   * @param  {Object} response = {} Search response as initial context.
   * @return {Object}               Extended search response.
   * @protected
  ###
  __buildContext: (response = {}) ->
    super

    terms = response.facets[@facet].terms.buckets
    selectedTerms = (response?.filter?.terms?[@facet]) or []

    @totalSelected = selectedTerms.length

    # merge is not safe for arrays of objects!
    @currentContext.name = @facet
    @currentContext.terms = terms.map (term, index) =>
      term.index = index
      term.name = @facet
      term.selected = (selectedTerms.indexOf term.key) >= 0
      term
    @currentContext


  ###*
   * Renders the widget with the data received, by replacing its content.
   *
   * @param {Object} res Search response.
   * @fires TermsFacet#df:widget:render
  ###
  render: (res) ->
    if res.page is 1
      if res.facets[@facet].terms.buckets.length > 0
        super res
      else
        @clean()
    else
      false

  clean: ->
    @totalSelected = 0
    super

  toString: -> "#{@facet} (#{super()})"

module.exports = TermsFacet
