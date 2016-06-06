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
    @slider = null

    super(container, template, options)

  renderSlider: (options) ->
    _this = this

    # render HTML
    context = $.extend true, name: @name, @extraContext || {}
    container = document.querySelector(@container)
    container.innerHTML = @mustache.render(@template, context)

    # Create Slider
    @slider = $(@sliderSelector).get(0)
    noUiSlider.create @slider, options
    @renderPips options

    # Listen "change" event so we can query Doofinder with new filters
    @slider.noUiSlider.on 'change', () ->
      [min, max] = _this.slider.noUiSlider.get()
      _this.controller.addFilter(_this.name, {'gte': parseFloat(min, 10), 'lte': parseFloat(max, 10)})
      _this.controller.refresh()

  updateSlider: (options) ->
    # remove pips
    # pips = @slider.querySelector '.noUi-pips'
    # pips.parentElement.removeChild pips

    # update slider and pips
    @slider.noUiSlider.updateOptions options
    @renderPips options
    # @slider.noUiSlider.pips options.pips

  renderPips: (options) ->
    # pips are buggy in noUiSlider so we are going to paint them ourselves
    # unless options.pips has a value (either false or real options)
    if options.pips is undefined
      pips = @slider.querySelector('div.noUi-pips.noUi-pips-horizontal')
      values =
        0: options.format.to(options.range.min)
        50: options.format.to((options.range.min + options.range.max) / 2.0)
        100: options.format.to(options.range.max)

      if pips is null
        # create pips container
        pips = document.createElement 'div'
        pips.setAttribute 'class', 'noUi-pips noUi-pips-horizontal'

        # add pips
        for pos in [0..100] by (100/16)
          markerType = if pos in [0, 50, 100] then 'large' else 'normal'
          pip = document.createElement 'div'
          pip.setAttribute 'class', "noUi-marker noUi-marker-horizontal noUi-marker-#{markerType}"
          pip.setAttribute 'style', "left: #{pos}%;"
          pips.appendChild pip

          # add values
          if pos in [0, 50, 100]
            value = document.createElement 'div'
            value.setAttribute 'class', 'noUi-value noUi-value-horizontal noUi-value-large'
            value.setAttribute 'data-position', pos
            value.setAttribute 'style', "left: #{pos}%;"
            value.innerText = values[pos+'']
            pips.appendChild value
      else
        # update pip values
        for node in pips.querySelectorAll('div[data-position]')
          node.innerText = values[node.getAttribute('data-position')]

    @slider.appendChild pips

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
        format:
          to: (value) ->
            value isnt undefined and (value.toFixed(2) + '').replace(/0+$/, '').replace(/\.{1}$/, '')
          from: Number

      options = $.extend true,
        options,
        @sliderOptions || {}

      if res and res.filter and res.filter.range and res.filter.range[@name]
        start = [parseFloat(res.filter.range[@name].gte, 10),
                 parseFloat(res.filter.range[@name].lte, 10)]
        options.start[0] = start[0] if not isNaN start[0]
        options.start[1] = start[1] if not isNaN start[1]

      disabled = options.range.min == options.range.max
      if disabled
        # noUiSlider raises an error so we represent the slider in a different way
        options.range.min -= 1
        options.range.max += 1
        options.step = 1

      if @slider is null
        @renderSlider options
      else
        @updateSlider options

      if disabled
        @slider.setAttribute 'disabled', true
      else
        @slider.removeAttribute 'disabled'

    @trigger('df:rendered', [res])

  renderNext: () ->

module.exports = RangeFacet
