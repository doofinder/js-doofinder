###
rangefacet.coffee
author: @ecoslado
2015 11 10
###

###
RangeFacet
This class receives a facet ranges and paint
them. Manages the filtering.
###

Display = require "../display"
$ = jQuery = require "../../util/jquery"
noUiSlider = require "nouislider"

class RangeFacet extends Display

  constructor: (container, @name, options = {}) ->
    if not options.template
      template = """
      <div class="df-panel" data-facet="{{name}}">
        <a href="#" class="df-panel__title" data-toggle="panel">{{label}}</a>
        <div class="df-panel__content">
          <div class="df-slider" data-facet="{{name}}">
            <div class="df-slider__range"></div>
          </div>
        </div>
      </div>
      """
    else
      template = options.template

    @sliderSelector = ".df-slider[data-facet='#{@name}'] > .df-slider__range"
    @sliderOptions = options.sliderOptions
    @sliderRendered = false

    super(container, template, options)

  renderSlider: (options) ->
    context = $.extend true, name: @name, @extraContext || {}
    html = @mustache.render(@template, context)
    $(@container).html html
    @sliderRendered = true

  render: (res) ->
    # Throws errors if prerrequisites are not accomplished.
    if not res.facets or not res.facets[@name]
      throw Error "Error in RangeFacet: #{@name} facet is not configured."
    else if not res.facets[@name].range
      throw Error "Error in RangeFacet: #{@name} facet is not a range facet."

    _this = this

    # update if any results
    if res.total > 0
      range = [parseFloat(res.facets[@name].range.buckets[0].stats.min, 10),
               parseFloat(res.facets[@name].range.buckets[0].stats.max, 10)]

      options =
        start: range
        range:
          min: range[0]
          max: range[1]
        connect: true
        tooltips: true
        pips:
          mode: 'range'

      options = $.extend true,
        options,
        @sliderOptions || {}

      if res and res.filter and res.filter.range and res.filter.range[@name]
        start = [parseFloat(res.filter.range[@name].gte, 10),
                 parseFloat(res.filter.range[@name].lte, 10)]
        options.start[0] = start[0] if not isNaN start[0]
        options.start[1] = start[1] if not isNaN start[1]

      console.log options

      if @sliderRendered isnt true
        # render the slider for the first time
        @renderSlider(options)

        slider = $(@sliderSelector).get(0)
        noUiSlider.create slider, options

        slider.noUiSlider.on 'change', () ->
          [min, max] = slider.noUiSlider.get()
          _this.controller.addFilter(_this.name, {'gte': parseFloat(min, 10), 'lte': parseFloat(max, 10)})
          _this.controller.refresh()

      else
        # update slider
        $(@sliderSelector).get(0).noUiSlider.updateOptions options

    @trigger('df:rendered', [res])

  renderNext: () ->

module.exports = RangeFacet
