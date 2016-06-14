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
                <a href="#" class="df-facet {{#selected}}df-facet--active{{/selected}}"
                    data-facet="{{name}}" data-value="{{ key }}">
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

    self = this

    # Clean selected  terms when new search
    @controller.bind "df:search", (params) ->
      self.selected = {}

    # The filtering by click
    $(@container).on 'click', "a[data-facet='#{@name}']", (e) ->
      e.preventDefault()

      termFacet = $(this)
      value = termFacet.data "value"
      key = termFacet.data "facet"

      if self.selected[value]
        delete self.selected[value]
        self.controller.removeFilter key, value
      else
        self.selected[value] = true
        self.controller.addFilter key, value

      self.controller.refresh()

    # Removes filters not present in results.
    @controller.bind "df:results_received", (res) ->
      if res.facets[self.name]?
        terms = res.facets[self.name].terms.buckets.map (term) -> term.key
      else
        terms = []

      for term, selected of self.selected
        if selected and not terms.indexOf(term) < 0
          delete self.selected[term]
          self.controller.removeFilter self.name, term

  render: (res) ->
    # Throws errors if prerrequisites are not
    # accomplished.
    if not res.facets or not res.facets[@name]
      @raiseError "TermFacet: #{@name} facet is not configured"
    else if not res.facets[@name].terms.buckets
      @raiseError "TermFacet: #{@name} facet is not a terms facet"

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
