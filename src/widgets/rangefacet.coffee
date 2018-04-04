extend = require "extend"
noUiSlider = require "nouislider"
Display = require "./display"
helpers = require "../util/helpers"


###*
 * Represents a range slider control to filter numbers within a range.
###
class RangeFacet extends Display
  @defaultTemplate = """
    <div class="df-slider" data-facet="{{name}}"></div>
  """
  @formatFn =
    to: (value) ->
      # noUISlider returns the formatted values when we retrieve them
      # so we maintain references to raw values inside an object.
      if value?
        value = parseFloat value, 10
        # noUiSlider uses innerText for pips so HTML entities like &euro;
        # are not escaped:
        #
        # https://github.com/leongersen/noUiSlider/blob/aa64a6d9/src/js/pips.js#L222
        #
        # I've filed an issue and I hope they'll fix it soon so that function
        # can be removed:
        #
        # https://github.com/leongersen/noUiSlider/issues/875
        #
        formattedValue = helpers.fn.decodeEntities @format value
        # formattedValue = @format value << code should be like this in an ideal world
        @values[formattedValue] = value
        formattedValue
      else
        ""
    from: (formattedValue) ->
      @values[formattedValue] or formattedValue

  @basicFormat = (value) ->
    ("#{value.toFixed 2}".replace /0+$/, "").replace /\.{1}$/, ""

  ###*
   * @param  {String|Node|DfDomElement} element Container node.
   * @param  {String} facet                     Name of the facet as defined
   *                                            in Doofinder.
   * @param  {Object} options                   Options object.
   * @public
   *
   * Options (apart from those inherited from Display):
   *
   * - pips: noUiSlider pips configuration or `false`. `undefined` by default.
   * - format: Function that receives a number and returns it formatted
   *           as string.
  ###
  constructor: (element, @facet, options = {}) ->
    defaults =
      template: @constructor.defaultTemplate
      pips: undefined
      format: undefined

    super element, (extend true, defaults, options)

    @format = @options.format or @constructor.basicFormat
    @slider = null    # node that actually holds noUiSlider stuff
    @values = {}      # keys are formatted numbers, values are raw numbers
    @range = {}       # range obtained from the search response
    @sliderOpts = {}  # options for the slider

  ###*
   * Renders the slider for the very first time.
   * @protected
   * @param  {Object} options Slider options.
  ###
  __renderSlider: (options) ->
    # Render template HTML and place it inside the container
    @element.html @__renderTemplate name: @facet

    # Create a node for the the slider and append it to the container.
    @slider = document.createElement 'div'
    (@element.find "[data-facet=\"#{@facet}\"]").append @slider

    # Initialize the slider
    noUiSlider.create @slider, options

    # Listen for the 'change' event so we can query Doofinder with new filters
    # Don't use 'set' event here or you will have problems.
    @slider.noUiSlider.on 'change', @__handleSliderChanged.bind @
    undefined

  ###*
   * Gets a proper range for the slider given a search response.
   * @protected
   * @param  {Object} res Search response.
   * @return {Object}     Object with `min`, `max`, `start` and `end` keys.
  ###
  __getRangeFromResponse: (response) ->
    stats = response.facets[@facet].range.buckets[0].stats
    range =
      min: (parseFloat stats.min or 0, 10)
      max: (parseFloat stats.max or 0, 10)
    if (rangeFilter = response?.filter?.range?[@facet])?
      # if we have values from search filtering we apply them
      range.start = (parseFloat rangeFilter.gte, 10) or range.min
      range.end = (parseFloat rangeFilter.lte, 10) or range.max
    else
      range.start = range.min
      range.end = range.max
    range

  ###*
   * Builds an options object for noUiSlider given a range object.
   *
   * @protected
   * @param  {Object} range Object as returned by `__getRangeFromResponse`.
   * @return {Object}       Options object.
  ###
  __getSliderOptions: (range) ->
    sliderOpts =
      start: [range.start, range.end]
      pips:
        mode: 'positions'
        values: [0, 50, 100]
        density: 6
        format:
          to: @constructor.formatFn.to.bind @
          from: @constructor.formatFn.from.bind @
      range:
        min: range.min
        max: range.max
      connect: true
      tooltips: true  # can't be overriden when options are updated!!!
      format:
        to: @constructor.formatFn.to.bind @
        from: @constructor.formatFn.from.bind @
    extend true, {}, sliderOpts, pips: @options.pips

  ###*
   * Updates the controller when the range changes.
   * @protected
  ###
  __handleSliderChanged: ->
    [start, end] = @get()

    if start == @range.min and end == @range.max
      # No need to filter
      @controller.removeFilter @facet
    else
      @controller.addFilter @facet, gte: start, lte: end

    # new search, reset values cache
    @values = {}
    @controller.refresh()

    @trigger "df:range:change", [
        start: start
        end: end
      ,
        min: @range.min
        max: @range.max
    ]

  ###*
   * Sets the range of the slider.
   * @param {Array} value 2-number array with min and max values to set.
  ###
  set: (value) ->
    @slider.noUiSlider.set value
    @__handleSliderChanged()

  ###*
   * Returns the current value of the slider.
   * @return {Array} value 2-number array with start and end values set.
  ###
  get: ->
    if @slider?
      [start, end] = @slider.noUiSlider.get()
      [@values[start], @values[end]]
    else
      []

  ###*
   * Called when the "first page" response for a specific search is received.
   * Renders the widget with the data received, by replacing its content.
   *
   * @param {Object} res Search response.
   * @fires RangeFacet#df:widget:render
  ###
  render: (response) ->
    if response.page is 1
      @range = @__getRangeFromResponse response

      if @range.min == @range.max
        # There's only one or no items with values in the range
        @clean()
      else
        # Update widget if any results found and there are range bounds
        @sliderOpts = @__getSliderOptions @range

        if @slider is null
          @__renderSlider @sliderOpts
        else
          @slider.noUiSlider.updateOptions @sliderOpts

        @trigger "df:widget:render", [response]

  ###*
   * Cleans the widget by removing all the HTML inside the container element.
   * Resets the `slider` property of the widget to remove any references to the
   * slider and allowing garbage collection.
  ###
  clean: ->
    @slider = null
    @values = {}
    super


module.exports = RangeFacet
