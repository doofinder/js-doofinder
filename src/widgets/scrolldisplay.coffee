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
  constructor: (element, template, options) ->
    super

    if @element.element[0] is window and not options.contentNode?
      throw "when the wrapper is window you must set contentNode option."

    self = this
    scrollOptions =
      callback: ->
        if self.controller? and not self.pageRequested
          self.pageRequested = true
          # if page fetch fails...
          setTimeout ->
            self.pageRequested = false
          , 5000
          self.controller.nextPage.call(self.controller)

    if options.scrollOffset?
      scrollOptions.scrollOffset = options.scrollOffset
    if options.contentWrapper?
      scrollOptions.content = options.contentWrapper

    @elementWrapper = @element

    if options.contentNode?
      @element = $ options.contentNode
    else if @element.element[0] is window
      @element = $ "body"
    else
      if not @element.children().length()
        @element.append (document.createElement 'div')
      @element = @element.children().first()

    dfScroll @elementWrapper, scrollOptions

  ###*
   * Initializes the object with a controller and attachs event handlers for
   * this widget instance.
   *
   * @param  {Controller} controller Doofinder Search controller.
  ###
  init: (controller) ->
    super
    @controller.bind 'df:search df:refresh', (params) =>
      @elementWrapper.scrollTop 0

  ###*
   * Called when subsequent (not "first-page") responses for a specific search
   * are received. Renders the widget with the data received, by appending
   * content after the last content received.
   *
   * @param {Object} res Search response.
   * @fires ScrollDisplay#df:rendered
  ###
  renderNext: (res) ->
    @pageRequested = false
    @element.append (@mustache.render @template, @buildContext res)
    @trigger "df:rendered", [res]


module.exports = ScrollDisplay
