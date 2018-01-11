extend = require "extend"
noUiSlider = require "nouislider"
Display = require "../display"


defaultTemplate = """<div class="{{sliderClassName}}" data-facet="{{name}}"></div>"""


###*
 * Represents a range slider control to filter numbers within a range.
###
class RangeFacet extends Display
  ###*
   * Apart from inherited options, this widget accepts these options:
   *
   * - sliderClassName (String) The CSS class of the node that actually holds
   *                            the slider.
   *
   * IMPORTANT: Pips support is buggy so, if no sliderOptions.pips is found, the
   * widget paints them itself. If the sliderOptions.pips is false, no pips are
   * displayed. In any other case, noUiSlider is in charge of displaying them.
   *
   * @param  {String|Node|DfDomElement} element  Container node.
   * @param  {String} facet    Name of the facet/filter.
   * @param  {Object} options Options object. Empty by default.
  ###
  constructor: (element, @facet, options = {}) ->
    options = extend true, template: defaultTemplate, options

    super element, options

    @sliderClassName = options.sliderClassName or 'df-slider'
    @sliderSelector =  ".#{@sliderClassName}[data-facet=\"#{@facet}\"]"

    if @options.format
      @format = @options.format
    else
      @format = (value) ->
        value? and (value.toFixed(2) + '').replace(/0+$/, '').replace(/\.{1}$/, '')

    @slider = null
    @values = {}
    @range = {}

  ###*
   * Renders the slider for the very first time.
   * @protected
   * @param  {Object} options Slider options.
  ###
  __renderSlider: (options) ->
    # Build template context
    context =
      name: @facet
      sliderClassName: @sliderClassName

    # Render template HTML and place it inside the container
    @element.html @renderTemplate context

    # Create a node for the the slider and append it to @sliderSelector
    @slider = document.createElement 'div'
    @element.find(@sliderSelector).append(@slider)

    # Initialize the slider
    noUiSlider.create @slider, options

    # Listen for the 'change' event so we can query Doofinder with new filters
    # Don't use 'set' event here or you will have problems.
    @slider.noUiSlider.on 'change', @__sliderChanged.bind @
    undefined

  ###
  Renders the slider pips

  @param {Object} Values for 0%, 50% and 100% pips ({0: 1, 50: 2, 100: 3})
  @api private
  ###
  ###*
   * Renders the slider's pips.
   * @param  {Object} values Values for 0%, 50% and 100% pips:
   *
   *                         {
   *                           0: 1,
   *                           50: 2,
   *                           100: 3
   *                         }
  ###
  __renderPips: (values) ->
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
          value.innerHTML = if values? then values["#{pos}"] else ''
          pips.appendChild value
    else
      # update pip values
      for node in pips.querySelectorAll('div[data-position]')
        node.innerHTML = if values? then values[node.getAttribute('data-position')] else ''

  ###*
   * Gets a proper range for the slider given a search response.
   * @protected
   * @param  {Object} res Search response.
   * @return {Object}     Object with `min` and `max` properties.
  ###
  __getRangeFromResponse: (res) ->
    stats = res.facets[@facet].range.buckets[0].stats
    range =
      min: parseFloat(stats.min || 0, 10)
      max: parseFloat(stats.max || 0, 10)

  __sliderChanged: ->
    [min, max] = @slider.noUiSlider.get()

    # TODO(@carlosescri): Probably all this controller stuff shouldn't be
    # here and the controller should know this is a Filter Widget and
    # listen for changes to refresh itself.

    if @values[min] == @range.min and @values[max] == @range.max
      # No need to filter
      @controller.removeFilter @facet
    else
      @controller.addFilter @facet,
        gte: @values[min]
        lte: @values[max]
    @controller.refresh()

    @trigger "df:range:change", [
        gte: @values[min]
        lte: @values[max]
      ,
        min: @range.min
        max: @range.max
    ]

    @values = {}

    # TODO(@carlosescri)'s proposal:
    # if @values[min] == @range.min and @values[max] == @range.max
    #   @trigger "df:filter:remove", [@facet]
    # else
    #   value =
    #     gte: @values[min]
    #     lte: @values[max]
    #   @trigger "df:filter:add", [@facet, value]
    #
    # @trigger "df:slider:change", [@values[min], @values[max]]
    # @values = {}

  set: (value) ->
    @slider.noUiSlider.set value
    @__sliderChanged()

  ###*
   * Called when the "first page" response for a specific search is received.
   * Renders the widget with the data received, by replacing its content.
   *
   * @param {Object} res Search response.
   * @fires RangeFacet#df:widget:render
  ###
  render: (res) ->
    if res.page is 1
      @range = @__getRangeFromResponse(res)

      if @range.min == @range.max
        # There's only one or no items with values in the range
        @clean()
      else
        # Update widget if any results found and there are range bounds

        options =
          start: [@range.min, @range.max]
          range: @range
          connect: true
          tooltips: true  # can't be overriden when options are updated!!!
          format:
            to: (value) =>
              # noUISlider gets the formatted values so we maintain references to
              # raw values inside an object.
              if value?
                formattedValue = @format value
                @values[formattedValue] = parseFloat value, 10
                formattedValue
              else
                ""
            from: (formattedValue) =>
              formattedValue

        # If we have values from search filtering we apply them
        if res?.filter?.range?[@facet]
          start = [parseFloat(res.filter.range[@facet].gte, 10),
                   parseFloat(res.filter.range[@facet].lte, 10)]
          options.start[0] = start[0] unless isNaN start[0]
          options.start[1] = start[1] unless isNaN start[1]

        if @slider is null
          @__renderSlider options
        else
          @slider.noUiSlider.updateOptions options

        # Pips are buggy in noUiSlider so we are going to paint them ourselves
        # unless options.pips has a value (either false or real options)
        unless options.pips?
          values =
            0: options.format.to options.range.min
            50: options.format.to((options.range.min + options.range.max) / 2.0)
            100: options.format.to options.range.max
          @__renderPips values

        @trigger "df:widget:render", [res]
        @trigger "df:rendered", [res] # DEPRECATED
    else
      false

  ###*
   * Cleans the widget by removing all the HTML inside the container element.
   * Resets the `slider` property of the widget to remove any references to the
   * slider and allowing garbage collection.
  ###
  clean: ->
    @slider = null
    super


module.exports = RangeFacet
