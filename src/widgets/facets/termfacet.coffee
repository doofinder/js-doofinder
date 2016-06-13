###
termfacet.coffee
author: @ecoslado
2015 11 10
###

Display = require "../display"
$ = require "jquery"

###
TermFacet
This class receives a facet terms and
paint them. Manages the filtering.
###
class TermFacet extends Display

  constructor: (container, @name, options = {}) ->
    @selected = {}
    if not options.template
      template = """
        {{#@index}}
          <hr class="df-separator">
        {{/@index}}
        <div class="df-panel">
          <a href="#" class="df-panel__title" data-toggle="panel">{{label}}</a>
          <div class="df-panel__content">
            <ul>
              {{#terms}}
              <li>
                <a href="#" class="df-facet {{#selected}}df-facet--active{{/selected}}" data-facet="{{name}}" data-value="{{ key }}">
                  {{ key }}
                  <span class="df-facet__count">{{ doc_count }}</span>
                </a>
              </li>
              {{/terms}}
            </ul>
          </div>
        </div>
      """
    else
      template = options.template

    super(container, template, options)

  init: (controller) ->
    super(controller)
    _this = this
    _name = @name

    # Clean selected  terms when new search
    @controller.bind "df:search", (params) ->
      _this.selected = {}

    # The filtering by click
    $(@container).on 'click', "a[data-facet='#{@name}']", (e) ->
      e.preventDefault()
      termFacet = $(this)
      value = termFacet.data "value"
      key = termFacet.data "facet"

      if _this.selected[value]
        delete _this.selected[value]
        _this.controller.removeFilter key, value
      else
        _this.selected[value] = 1
        _this.controller.addFilter key, value
      _this.controller.refresh()

    # Removes filters not present in results.
    @controller.bind "df:results_received", (event, res) ->
      terms = res.facets[_this.name].terms.buckets
      for term, selected of _this.selected
        if selected and not _this._termInResults(term, terms)
          _this.selected[term.key] = 0
          _this.controller.removeFilter _this.name, term

  _termInResults: (term, terms) ->
    for elem in terms
      if term == elem.key
        return true
    return false

  render: (res) ->
    # Throws errors if prerrequisites are not
    # accomplished.
    if not res.facets or not res.facets[@name]
      throw Error "Error in TermFacet: #{@name} facet is not configured."
    else if not res.facets[@name].terms.buckets
      throw Error "Error in TermFacet: #{@name} facet is not a term facet."

    if res.results
      # To make access to selected easier
      # we add it to each term
      for index, term of res.facets[@name].terms.buckets
        term.index = index
        term.name = @name

        if @selected[term.key]
          term.selected = 1
        else
          term.selected = 0

      context = $.extend true,
        any_selected: @selected.length > 0
        total_selected: @selected.length
        name: @name
        terms: res.facets[@name].terms.buckets,
        @extraContext || {}

      @addHelpers(context)
      html = @mustache.render(@template, context)
      $(@container).html html
    else
      $(@container).html ''

    @trigger('df:rendered', [res])

  renderNext: () ->

module.exports = TermFacet
