BaseFacet = require "./basefacet"
extend = require "extend"
$ = require "../../util/dfdom"


###*
 * Represents a terms selector control to filter by the possible values of a
 * text field.
###
class TermFacet extends BaseFacet
  @defaultLabelTemplate: "{{label}}{{#total_selected}} ({{total_selected}}){{/total_selected}}"
  @defaultTemplate: """
    <ul>
      {{#terms}}
      <li>
        <a href="#" data-facet="{{name}}" data-value="{{key}}" {{#selected}}data-selected{{/selected}}>
          {{ key }} <span>{{ doc_count }}</span>
        </a>
      </li>
      {{/terms}}
    </ul>
  """

  ###*
   * Initializes the object with a controller and attachs event handlers for
   * this widget instance.
   *
   * @param  {Controller} controller Doofinder Search controller.
  ###
  init: (controller) ->
    super

    # Handle clicks on terms by event delegation.
    # A term has both a data-facet and a data-value attribute (panel could have
    # a data-facet attribute so we're specific here to avoid strange behaviors).
    @element.on "click", "[data-facet='#{@name}'][data-value]", (e) =>
      e.preventDefault()

      termNode = ($ e.target)
      value = termNode.data "value"
      key = termNode.data "facet"
      wasSelected = e.target.hasAttribute "data-selected"

      unless wasSelected
        termNode.attr "data-selected", ""
        @controller.addFilter key, value
      else
        termNode.removeAttr "data-selected"
        @controller.removeFilter key, value

      @controller.refresh()

      clickInfo =
        widget: @
        termNode: termNode.element[0]
        facetName: key
        facetValue: value
        isSelected: not wasSelected

      @trigger "df:term_clicked", [clickInfo]

  ###*
   * @return {DfDomElement} Collection of selected term nodes.
  ###
  getSelectedElements: ->
    @element.find "[data-facet][data-selected]"

  ###*
   * @return {Number} Number of selected term nodes.
  ###
  countSelectedElements: ->
    @getSelectedElements().length()

  ###*
   * @param  {Object} res Results response from the server.
   * @return {Number}     Total terms used for filter.
  ###
  countSelectedTerms: (res) ->
    (res.filter?.terms?[@name] or []).length

  ###*
   * Renders the label of the facet widget based on the given search response,
   * within the configured label template. The number of selected terms is
   * passed to the context so it can be used in the template.
   *
   * @param  {Object} res Search response.
   * @return {String}     The rendered label.
  ###
  renderLabel: (res) ->
    super extend true, res, total_selected: (@countSelectedTerms res)

  ###*
   * Called when the "first page" response for a specific search is received.
   * Renders the widget with the data received, by replacing its content.
   *
   * @param {Object} res Search response.
   * @fires TermFacet#df:rendered
  ###
  render: (res) ->
    # Throws errors if pre-requisites are not satisfied.
    if not res.facets or not res.facets[@name]
      @raiseError "TermFacet: #{@name} facet is not configured"
    else if not res.facets[@name].terms.buckets
      @raiseError "TermFacet: #{@name} facet is not a terms facet"

    if res.results
      selectedTerms = {}
      for term in (res.filter?.terms?[@name] or [])
        selectedTerms[term] = true
      selectedTerms

      for index, term of res.facets[@name].terms.buckets
        term.index = index
        term.name = @name

        if selectedTerms[term.key]
          term.selected = 1
        else
          term.selected = 0

      totalSelected = @countSelectedTerms res
      context = extend true,
        any_selected: totalSelected > 0
        total_selected: totalSelected
        name: @name
        terms: res.facets[@name].terms.buckets,
        @extraContext || {}

      @element.html (@mustache.render @template, (@addHelpers context))
    else
      @element.html ""

    @trigger "df:rendered", [res]

module.exports = TermFacet
