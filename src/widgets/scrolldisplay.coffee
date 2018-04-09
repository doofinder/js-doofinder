throttle = require "lodash.throttle"

$ = require "../util/dfdom"
merge = require "../util/merge"
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
   * - contentElement:  By default content will be rendered inside the scroller
   *                    unless this option is set to a valid container. This is
   *                    optional unless the scroller is the window object, in
   *                    that case this is mandatory.
   * - offset:          Distance to the bottom. If the scroll reaches this point a new
   *                    results page will be requested.
   * - throttle:        Time in milliseconds to wait between scroll checks. This
   *                    value limits calculations associated to the scroll event.
   * - horizontal:      False by default. Scroll is handled vertically by default.
   *                    If this options is enabled scroll is handled horizontally.
   *
   * Markup:
   *
   * You can just use a container element. Content will be rendered inside.
   *
   *  ______________________
   * |                      |
   * |  `element`           |
   * |  __________________  |
   * | |                  | |
   * | | RENDERED CONTENT | |
   * | |__________________| |
   * |______________________|
   *
   * If you need to put extra content inside the container, before or after
   * the rendered results, use the `contentElement` option:
   *
   *  __________________________
   * |                          |
   * |  `element`               |
   * |  ______________________  |
   * | |                      | |
   * | | HEADER               | |
   * | |______________________| |
   * |  ______________________  |
   * | |                      | |
   * | | `contentElement`     | |
   * | |  __________________  | |
   * | | |                  | | |
   * | | | RENDERED CONTENT | | |
   * | | |__________________| | |
   * | |______________________| |
   * |  ______________________  |
   * | |                      | |
   * | | FOOTER               | |
   * | |______________________| |
   * |__________________________|
   *
   * IMPORTANT: Don't rely on the `element` attribute to do stuff with the
   * container, if you use the `contentElement` option, that node will become
   * the `element` node. To access the container always use the `container`
   * attribute.
   *
   * TODO: Check how this works when the container is the window object.
  ###
  constructor: (element, options) ->
    defaultOptions =
      contentElement: null
      offset: 300
      throttle: 16
      horizontal: false
    options = merge defaultOptions, (options or {})

    super element, options

    @container = @element
    @__setContentElement()

    @working = false
    @previousDelta = 0

  ###*
   * Gets the element that will hold search results.
  ###
  __setContentElement: ->
    if @options.contentElement?
      @setElement @element.find @options.contentElement
    else if Thing.is.window @element.get(0)
      throw "ScrollDisplay: contentElement must be specified when the container is the window object"

  init: ->
    unless @initialized
      fn = if @options.horizontal then @__scrollX else @__scrollY
      @container.on "scroll", (throttle (fn.bind @), @options.throttle)
      @controller.on "df:search df:refresh", (query, params) =>
        @container.scrollTop 0
      super

  __scrollX: ->
    rect = @container.box()
    width = rect.scrollWidth
    scrolled = rect.scrollLeft + rect.clientWidth
    @__getNextPage() if width - scrolled <= @options.offset
    direction = if rect.scrollLeft >= @previousDelta then "right" else "left"
    @previousDelta = rect.scrollLeft
    @trigger "df:widget:scroll", [rect.scrollLeft, direction]

  __scrollY: ->
    rect = @container.box()
    height = rect.scrollHeight
    scrolled = rect.scrollTop + rect.clientHeight
    @__getNextPage() if height - scrolled <= @options.offset
    direction = if rect.scrollTop >= @previousDelta then "down" else "up"
    @previousDelta = rect.scrollTop
    @trigger "df:widget:scroll", [rect.scrollTop, direction]

  __getNextPage: ->
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
      @element.append @__renderTemplate res
      @trigger "df:widget:render", [res]

module.exports = ScrollDisplay
