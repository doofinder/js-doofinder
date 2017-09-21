BaseFacet = require "./basefacet"
extend = require "extend"
$ = require "../../util/dfdom"

defaultTemplate = """
  {{#terms}}
    <a class="df-term" href="#" data-facet="{{name}}" data-value="{{key}}"
        {{#extra-content}}{{index}}:{{size}}{{/extra-content}}
        {{#selected}}data-selected{{/selected}}>
      {{key}} <span class="df-term__count">{{doc_count}}</span>
    </a>
  {{/terms}}
  {{#show-more-button}}{{terms.length}}:{{size}}{{/show-more-button}}
"""

defaultButtonTemplate = """
  <button type="button" data-toggle-extra-content
      data-text-normal="{{#translate}}{{viewMoreLabel}}{{/translate}}"
      data-text-toggle="{{#translate}}{{viewLessLabel}}{{/translate}}">
    {{#translate}}{{viewMoreLabel}}{{/translate}}
  </button>
"""

defaultLabelTemplate = "{{label}}{{#total_selected}} ({{total_selected}}){{/total_selected}}"


###*
 * Represents a terms selector control to filter by the possible values of a
 * text field.
###
class TermsFacet extends BaseFacet
  ###*
   * @param  {String|Node|DfDomElement} element  Container node.
   * @param  {String} name    Name of the facet/filter.
   * @param  {Object} options Options object. Empty by default.
  ###
  constructor: (element, name, options = {}) ->
    defaults =
      size: null  # set an int value to enable extra content behavior
      template: defaultTemplate
      buttonTemplate: defaultButtonTemplate
      labelTemplate: defaultLabelTemplate
      templateVars:
        viewMoreLabel: "View more..."
        viewLessLabel: "View less..."
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
            [index, size] = (render text).split ":"
            if (parseInt index.trim(), 10) >= (parseInt size.trim(), 10)
              "data-extra-content"
            else
              ""
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
            [length, size] = (render text).split ":"
            if (parseInt length.trim(), 10) > (parseInt size.trim(), 10)
              @mustache.render @options.buttonTemplate, @buildContext()
            else
              ""
    options = extend true, defaults, options
    super element, name, options

  ###*
   * Initializes the object with a controller and attachs event handlers for
   * this widget instance.
   *
   * @param  {Controller} controller Doofinder Search controller.
  ###
  init: ->
    unless @initialized
      # Handle clicks on terms by event delegation.
      # A term has both a data-facet and a data-value attribute (panel could have
      # a data-facet attribute so we're specific here to avoid strange behaviors).
      @element.on "click", "[data-facet='#{@name}'][data-value]", (e) =>
        e.preventDefault()

        termNode = ($ e.target)
        value = termNode.data "value"
        key = termNode.data "facet"
        wasSelected = termNode.hasAttr "data-selected"

        unless wasSelected
          termNode.attr "data-selected", ""
          @controller.addFilter key, value
        else
          termNode.removeAttr "data-selected"
          @controller.removeFilter key, value

        @controller.refresh()

        # TODO(@carlosescri): attrs should be params of the event handler
        eventInfo =
          facetName: key
          facetValue: value
          selected: not wasSelected
          totalSelected: @getSelectedElements().length

        @trigger "df:term:click", [eventInfo]

      if @options.size?

        # - Declare the container element to display or hide extra terms when the
        #   view more button is clicked.

        @element.on "click", "[data-toggle-extra-content]", (e) =>
          e.preventDefault()

          btn = @getShowMoreButton()

          currentText  = btn.textContent.trim()
          viewMoreText = (btn.getAttribute "data-text-normal").trim()
          viewLessText = (btn.getAttribute "data-text-toggle").trim()

          if currentText == viewMoreText
            btn.textContent = viewLessText
            @element.attr "data-view-extra-content", ""
          else
            btn.textContent = viewMoreText
            @element.removeAttr "data-view-extra-content"

        # - Fix the "view more" button when the container element is displaying
        #   extra content but the controller is refreshed and the facet widget is
        #   rendered again.

        @on "df:widget:render", (res) =>
          if (@element.attr "data-view-extra-content")?
            btn = @getShowMoreButton()
            btn?.textContent = (btn.getAttribute "data-text-toggle").trim()

        # - Reset also the "view more" state of the container element when the
        #   widget is reset.

        @on "df:widget:clean", (res) =>
          @element.removeAttr "data-view-extra-content"
          btn = @getShowMoreButton()
          btn?.textContent = (btn.getAttribute "data-text-normal").trim()

  ###*
   * @return {HTMLElement} The "show more" button.
  ###
  getShowMoreButton: ->
    (@element.find "[data-toggle-extra-content]").element[0]

  ###*
   * @return {DfDomElement} Collection of selected term nodes.
  ###
  getSelectedElements: ->
    @element.find "[data-facet][data-selected]"

  ###*
   * @return {Number} Number of selected term nodes.
  ###
  countSelectedElements: ->
    @getSelectedElements().length

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
   * @fires TermsFacet#df:widget:render
  ###
  render: (res) ->
    if res.page = 1
      # Throws errors if pre-requisites are not satisfied.
      if not res.facets or not res.facets[@name]
        @raiseError "TermsFacet: #{@name} facet is not configured"
      else if not res.facets[@name].terms.buckets
        @raiseError "TermsFacet: #{@name} facet is not a terms facet"

      if res.facets[@name].terms.buckets.length > 0
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
          terms: res.facets[@name].terms.buckets

        eventInfo =
          facetName: @name
          totalSelected: totalSelected

        # TODO(@carlosescri): pass res extended with {facet: context} and
        # update default templates ¿?
        @element.html @renderTemplate context
        @trigger "df:widget:render", [res, eventInfo]
      else
        @clean()

module.exports = TermsFacet
