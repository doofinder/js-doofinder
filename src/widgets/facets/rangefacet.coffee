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
noUiSlider = require "nouislider"
extend = require "extend"

class RangeFacet extends Display

  ###
  Initializes the widget

  @param {String} container
  @param {String|Function} template
  @param {Object} options

  Apart from those inherited, this widget accepts these options:

  - sliderClassName {String} The CSS class of the node that holds the slider.

  IMPORTANT: Pips support is buggy so, if no sliderOptions.pips is found, the
  widget paints them itself. If the sliderOptions.pips is false, no pips are
  displayed. In any other case, noUiSlider is in charge of displaying them.

  @api public
  ###
  constructor: (element, @name, options = {}) ->
    @sliderClassName = options.sliderClassName or 'df-slider'
    @sliderSelector =  ".#{@sliderClassName}[data-facet='#{@name}']"

    if not options.template
      template = """
      <div class="df-panel" data-facet="{{name}}">
        <a href="#" class="df-panel__title" data-toggle="panel">{{label}}</a>
        <div class="df-panel__content">
          <div class="{{sliderClassName}}" data-facet="{{name}}"></div>
        </div>
      </div>
      """
    else
      template = options.template

    if options.format
      @format = options.format
    else
      @format = (value) ->
        value? and (value.toFixed(2) + '').replace(/0+$/, '').replace(/\.{1}$/, '')

    @slider = null
    @values = {}

    super(element, template, options)

  ###
  Renders the slider for the very first time.

  @param {Object} Slider options
  @api private
  ###
  _renderSlider: (options) ->
    self = this

    # Build template context
    context =
      name: @name
      sliderClassName: @sliderClassName
    context = extend true, context, @extraContext or {}

    # Render template HTML and place it inside the container
    @element.html @mustache.render @template, context

    # Create a node for the the slider and append it to @sliderSelector
    @slider = document.createElement 'div'
    @element.find(@sliderSelector).append(@slider)

    # Initialize the slider
    noUiSlider.create @slider, options

    # Listen for the 'change' event so we can query Doofinder with new filters
    @slider.noUiSlider.on 'change', ->
      [min, max] = self.slider.noUiSlider.get()
      # WTF(@ecoslado) noUISlider gets the formatted values
      # so we maintain an object with key the formatted values
      # and value the numbers
      self.controller.addFilter self.name,
        gte: self.values[min]
        lte: self.values[max]
      self.controller.refresh()
      self.values = {}

  ###
  Renders the slider pips

  @param {Object} Values for 0%, 50% and 100% pips ({0: 1, 50: 2, 100: 3})
  @api private
  ###
  _renderPips: (values) ->
    pips = @slider.querySelector('div.noUi-pips.noUi-pips-horizontal')
    if pips is null
      # create pips container
      pips = document.createElement 'div'
      pips.setAttribute 'class', 'noUi-pips noUi-pips-horizontal'
      @slider.appendChild pips

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
          value.innerHTML = if values? then values[pos+''] else ''
          pips.appendChild value
    else
      # update pip values
      for node in pips.querySelectorAll('div[data-position]')
        node.innerHTML = if values? then values[node.getAttribute('data-position')] else ''

  ###
  Paints the slider based on the received response.

  @param {Object} Response
  @api public
  ###
  render: (res) ->
    # Throws errors if prerrequisites are not accomplished.
    if not res.facets or not res.facets[@name]
      @raiseError "RangeFacet: #{@name} facet is not configured"
    else if not res.facets[@name].range
      @raiseError "RangeFacet: #{@name} facet is not a range facet"

    self = this

    # Update widget if any results found
    if res.total > 0
      range = [parseFloat(res.facets[@name].range.buckets[0].stats.min || 0, 10),
               parseFloat(res.facets[@name].range.buckets[0].stats.max || 0, 10)]

      options =
        start: range
        range:
          min: range[0]
          max: range[1]
        connect: true
        tooltips: true  # can't be overriden when options are updated!!!
        format:
          to: (value) ->
            # WTF(@ecoslado) noUISlider gets the formatted values
            # so we maintain an object with key the formatted values
            # and value the numbers
            if value?
              formattedValue = self.format value
              self.values[formattedValue] = value
              formattedValue
            else
              ""
          from: (formattedValue) ->
            formattedValue

      # If we have values from search filtering we apply them
      if res and res.filter and res.filter.range and res.filter.range[@name]
        start = [parseFloat(res.filter.range[@name].gte, 10),
                 parseFloat(res.filter.range[@name].lte, 10)]
        options.start[0] = start[0] unless isNaN start[0]
        options.start[1] = start[1] unless isNaN start[1]

      # noUiSlider raises an error when range limits are equal so we hack the
      # slider to represent this state properly

      disabled = options.range.min == options.range.max
      if disabled
        overrides =
          range:
            min: options.range.min
            max: options.range.max + 1
          # tooltips: false  # can't be overriden :-( Use CSS to handle display

      if @slider is null
        @_renderSlider extend(true, {}, options, overrides or {})
      else
        @slider.noUiSlider.updateOptions extend(true, {}, options, overrides or {})

      if disabled
        @slider.setAttribute 'disabled', true
      else
        @slider.removeAttribute 'disabled'

      # Pips are buggy in noUiSlider so we are going to paint them ourselves
      # unless options.pips has a value (either false or real options)
      unless options.pips?
        if not disabled
          values =
            0: options.format.to(options.range.min)
            50: options.format.to((options.range.min + options.range.max) / 2.0)
            100: options.format.to(options.range.max)
          @_renderPips values
        else
          @_renderPips()  # coffee needs () here!!!

    @trigger('df:rendered', [res])

  renderNext: ->

  clean: () ->
    super()
    @slider = null

module.exports = RangeFacet
