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
    
    @bind "df:search", (params) -> 	
      _this.selected = {}

    $(@container).on 'click', "a[data-facet='#{@name}']", (e) ->
        e.preventDefault()
        termFacet = $(e.toElement)
        value = termFacet.data "value" 
        key = termFacet.data "facet"

        if _this.selected[value]
            _this.controller.removeFilter key, value
            _this.selected[value] = 0
        
        else
            _this.controller.addFilter key, value
            _this.selected[value] = 1
        
        _this.controller.refresh()

  render: (res) ->
    # Throws errors if prerrequisites are not
    # accomplished.
    if not res.facets or not res.facets[@name]
      throw Error "Error in TermFacet: #{@name} facet is not configured."
    else if not res.facets[@name].terms
      throw Error "Error in TermFacet: #{@name} facet is not a term facet."

    # To make access to selected easier
    # we add it to each term  
    for term in res.facets[@name].terms
      if @selected[term.term]
        term.selected = 1
      else
        term.selected = 0
      
    context = $.extend true, 
      name: @name 
      terms: res.facets[@name].terms, 
      @extraContext || {}

    html = @template(context)
    $(@container).html html
    @trigger('df:rendered', [res])

  renderNext: () ->

module.exports = TermFacet