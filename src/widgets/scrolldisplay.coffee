extend = require "extend"
throttle = require "lodash.throttle"

$ = require "../util/dfdom"
Thing = require "../util/thing"

Display = require "./display"


###*
 * Displays results by appending subsequent pages for the same search instead of
 * replacing them, and requests next pages when the user reaches the end of the
 * last page rendered.
###
class ScrollDisplay extends Display
  ###*
   * @param  {DfDomElement|Element|String} element Will be used as scroller.
   * @param  {Object} options
   *
   * Options:
   *
   * - contentElement: By default content will be rendered inside the scroller
   *     unless this option is set to a valid container. This is optional unless
   *     the scroller is the window object, in which case this is mandatory.
   * - offset: Distance to the bottom. If the scroll reaches this point a new
   *     results page will be requested.
   * - horizontal: False by default. Scroll is handled vertically by default. If
   *     this options is enabled scroll is handled horizontally.
   *
   * Old Schema, for reference:
   *
   *
   *  elementWrapper
   *  --------------------
   * |  contentWrapper   ^|
   * |  ---------------  !|
   * | |  element      | !|
   * | |  ------------ | !|
   * | | |            || !|
   * | | | items here || !|
   * | | |            || !|
   * | |  ------------ | !|
   * |  ---------------  !|
   *  --------------------
   *
   * TODO: Check if this can handle all cases (it's supposed to do so because
   * its not based on content).
   * TODO: Check how this works when the container is the window object.
  ###
  constructor: (element, options) ->
    defaultOptions =
      contentElement: null
      offset: 300
      throttle: 16
      horizontal: false
    options = extend true, defaultOptions, options

    super

    @scroller = @element
    @setContentElement()

    @working = false
    @previousDelta = 0

  ###*
   * Gets the element that will hold search results.
   * @return {[type]} [description]
  ###
  setContentElement: ->
    if @options.contentElement?
      @setElement @element.find @options.contentElement
    else if Thing.is.window @element.get(0)
      throw "ScrollDisplay: contentElement must be specified when the scroller is the window object"

  init: ->
    unless @initialized
      fn = if @options.horizontal then @scrollX else @scrollY
      @scroller.on "scroll", (throttle (fn.bind @), @options.throttle, leading: true)
      @controller.on "df:search df:refresh", (query, params) =>
        @scroller.scrollTop 0
      super

  scrollX: ->
    rect = @scroller.box()
    width = rect.scrollWidth
    scrolled = rect.scrollLeft + rect.clientWidth
    @getNextPage() if width - scrolled <= @options.offset
    direction = if rect.scrollLeft >= @previousDelta then "right" else "left"
    @previousDelta = rect.scrollLeft
    @trigger "df:widget:scroll", [rect.scrollLeft, direction]
    @scroller.trigger "df:scroll" # DEPRECATED

  scrollY: ->
    rect = @scroller.box()
    height = rect.scrollHeight
    scrolled = rect.scrollTop + rect.clientHeight
    @getNextPage() if height - scrolled <= @options.offset
    direction = if rect.scrollTop >= @previousDelta then "down" else "up"
    @previousDelta = rect.scrollTop
    @trigger "df:widget:scroll", [rect.scrollTop, direction]
    @scroller.trigger "df:scroll" # DEPRECATED

  getNextPage: ->
    if @controller? and not @working
      @working = true
      # just in case page fetching fails, revert lock
      setTimeout (=> @working = false), 2000
      @controller.getNextPage()

  render: (res) ->
    if res.page is 1
      super
    else
      @working = false
      @element.append @renderTemplate res
      @trigger "df:widget:render", [res]
      @trigger "df:rendered", [res] # DEPRECATED

module.exports = ScrollDisplay
