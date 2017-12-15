extend = require "extend"

$ = require "../util/dfdom"
Debouncer = require "../util/debouncer"
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
   * - vertical: True by default. Otherwise scroll is handled horizontally.
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
      vertical: true
    options = extend true, defaultOptions, options

    super

    @scroller = @element
    @setContentElement()

    fn = if @options.vertical then @scrollY else @scrollX
    @debouncer = new Debouncer (fn.bind @)
    @working = false

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
      # bean doesn't support EventListener interface via objects???
      @scroller.get(0).addEventListener "scroll", @debouncer
      @controller.on "df:search df:refresh", (query, params) =>
        @scroller.scrollTop 0
      super

  scrollX: ->
    width = rect.scrollWidth
    scrolled = rect.scrollLeft + rect.clientWidth
    @getNextPage() if width - scrolled <= @options.offset

  scrollY: ->
    rect = @scroller.box()
    height = rect.scrollHeight
    scrolled = rect.scrollTop + rect.clientHeight
    @getNextPage() if height - scrolled <= @options.offset

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

module.exports = ScrollDisplay
