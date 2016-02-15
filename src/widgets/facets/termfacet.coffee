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
      template = '{{#if @index}}' + 
            '<hr class="df-separator">' +
            '{{/if}}' +
            '<div class="df-facets">'+
            '<a href="#" class="df-panel__title" data-toggle="panel">{{label}}</a>'+
            '<div class="df-facets__content">'+
            '<ul>'+
            '{{#each terms}}'+
            '<li>'+
            '<a href="#" class="df-facet {{#if selected}}df-facet--active{{/if}}" data-facet="{{../name}}"'+
            'data-value="{{ term }}">{{ term }} <span'+
            'class="df-facet__count">{{ count }}</span></a>'+
            '</li>'+
            '{{/each}}'
    else
      template = options.template

    super(container, template, options)
  
  init: (controller) ->
    super(controller)
    _this = this
    
    # Clean selected  terms when new search
    @bind "df:search", (params) ->  
      _this.selected = {}

    # The filtering by click
    $(@container).on 'click', "a[data-facet='#{@name}']", (e) ->
        e.preventDefault()
        termFacet = $(this)
        value = termFacet.data "value" 
        key = termFacet.data "facet"

        if _this.selected[value]
            _this.controller.removeFilter key, value
        
        else
            _this.controller.addFilter key, value
        
        _this.controller.refresh()

    # Removes filters not present in results.
    @controller.bind "df:results_received", (event, res) ->
      terms = res.facets[_this.name].terms
      for term, selected of _this.selected
        if selected and not _this._termInResults(term, terms)
          _this.selected[term] = 0
          _this.controller.removeFilter _this.name, term 

  _termInResults: (term, terms) ->
    for elem in terms
      if term == elem.term
        return true
    return false

  render: (res) ->
    # Throws errors if prerrequisites are not
    # accomplished.
    if not res.facets or not res.facets[@name]
      throw Error "Error in TermFacet: #{@name} facet is not configured."
    else if not res.facets[@name].terms
      throw Error "Error in TermFacet: #{@name} facet is not a term facet."
    
    @selected = {}
    totalSelected = 0
    if res.filter and res.filter.terms and res.filter.terms[@name]
      for term in res.filter.terms[@name]
        @selected[term] = 1
        totalSelected += 1

    if res.results
      # To make access to selected easier
      # we add it to each term  
      for key, term of res.facets[@name].terms
        term.key = key
        if @selected[term.term]
          term.selected = 1
        else
          term.selected = 0
        
      context = $.extend true,
        total_selected: totalSelected 
        name: @name 
        terms: res.facets[@name].terms, 
        @extraContext || {}

      @addHelpers(context)
      html = @mustache(@template, context)
      $(@container).html html
      @trigger('df:rendered', [res])
    else
      $(@container).html ''

  renderNext: () ->

module.exports = TermFacet