###
termfacet.coffee
author: @ecoslado
2015 11 10
###

Display = require "../display"
extend = require "extend"
$ = require "../../util/dfdom"

###
TermFacet
This class receives a facet terms and
paint them. Manages the filtering.
###
class TermFacet extends Display

  constructor: (element, @name, options = {}) ->
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
                    data-facet="{{name}}" data-value="{{ key }}" {{#selected}}data-selected{{/selected}}>
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

    super(element, template, options)

  init: (controller) ->
    super(controller)

    self = this

    # The filtering by click
    # attr name within " in case a ' is inside
    @element.on 'click', "[data-facet='#{@name}']", (e) ->
      e.preventDefault()

      value = $(this).data 'value'
      key = $(this).data 'facet'

      unless this.hasAttribute 'data-selected'
        this.setAttribute 'data-selected', ''
        self.controller.addFilter key, value
      else
        this.removeAttribute 'data-selected'
        self.controller.removeFilter key, value

      self.controller.refresh()

  render: (res) ->
    # Throws errors if prerrequisites are not
    # accomplished.
    if not res.facets or not res.facets[@name]
      @raiseError "TermFacet: #{@name} facet is not configured"
    else if not res.facets[@name].terms.buckets
      @raiseError "TermFacet: #{@name} facet is not a terms facet"

    selectedTerms = {}
    for term in (res.filter?.terms?[@name] or [])
      selectedTerms[term] = true

    if res.results
      # To make access to selected easier
      # we add it to each term
      for index, term of res.facets[@name].terms.buckets
        term.index = index
        term.name = @name

        if selectedTerms[term.key]
          term.selected = 1
        else
          term.selected = 0

      selected_length = Object.keys(selectedTerms).length

      context = extend true,
        any_selected: selected_length > 0
        total_selected: selected_length
        name: @name
        terms: res.facets[@name].terms.buckets,
        @extraContext || {}
      @addHelpers(context)

      @element.html @mustache.render(@template, context)
    else
      @element.html ''

    @trigger('df:rendered', [res])

  renderNext: () ->

module.exports = TermFacet
