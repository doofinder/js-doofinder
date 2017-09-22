Display = require "./display"
dfScroll = require "../util/dfscroll"
extend = require 'extend'
$ = require '../util/dfdom'


###*
 * Displays results by appending subsequent pages for the same search instead of
 * replacing them, and requests next pages when the user reaches the end of the
 * last page rendered.
###
class ScrollDisplay extends Display

  ###*
   * Options:
   *
   * - scrollOffset: 200
   * - contentNode: Node that holds the results will become the container
   *   element of the widget.
   * - contentWrapper: Node that is used for scrolling instead of the first
   *   child of the container.
   *
   *  elementWrapper
   *  -------------------
   * |  contentWrapper  ^|
   * |  --------------- !|
   * | |  element      |!|
   * | |  ------------ |!|
   * | | |  items     ||!|
   *
   * TODO(@carlosescri): Document this better!!!
   *
   * @param  {[type]} element  [description]
   * @param  {[type]} template [description]
   * @param  {[type]} options  [description]
   * @return {[type]}          [description]
  ###
  constructor: (element, options) ->
    super

    if @element.element[0] is window and not options.contentNode?
      throw "when the wrapper is window you must set contentNode option."

    scrollCallback = =>
      if @controller? and not @pageRequested
        @pageRequested = true
        # if page fetching fails...
        setTimeout (=> @pageRequested = false), 5000
        @controller.getNextPage()

    scrollOptions =
      callback: scrollCallback
    if @options.scrollOffset?
      scrollOptions.scrollOffset = @options.scrollOffset
    if @options.contentWrapper?
      scrollOptions.content = @options.contentWrapper

    @elementWrapper = @element

    if @options.contentNode?
      @element = $ @options.contentNode
    else if @element.get(0) is window
      @element = $ "body"
    else
      if not @element.children().length
        @element.append 'div'
      @element = @element.children().first()

    dfScroll @elementWrapper, scrollOptions

  ###*
   * Initializes the object with a controller and attachs event handlers for
   * this widget instance.
   *
   * @param  {Controller} controller Doofinder Search controller.
  ###
  init: ->
    unless @initialized
      @controller.on "df:search df:refresh", (query, params) =>
        @elementWrapper.scrollTop 0
      super

  render: (res) ->
    if res.page is 1
      super
    else
      @pageRequested = false
      @element.append @renderTemplate res
      @trigger "df:widget:render", [res]


module.exports = ScrollDisplay
