###
scrolldisplay.coffee
author: @ecoslado
2015 11 10
###

###
ScrollDisplay
This class receives the search
results and paint them in a container
shaped by template. Ask for a new page
when scroll in wrapper reaches the
bottom
###

Display = require "./display"
dfScroll = require "../util/dfscroll"
extend = require 'extend'
$ = require '../util/dfdom'

class ScrollDisplay extends Display

  ###
  constructor

  just assign wrapper property for scrolling and
  calls super constructor.

  @param {String} element
  @param {String|Function} template
  @param {Object} extraOptions
  @api public
  ###
  constructor: (element, template, options) ->
    self = this
    super(element, template, options)
    scrollOptions = extend true,
      callback: ->
        if self.controller? and not self.pageRequested
          self.pageRequested = true
          # if page fetch fails...
          setTimeout ->
            self.pageRequested = false
          , 5000
          self.controller.nextPage.call(self.controller)
      ,
      if options.scrollOffset? then scrollOffset: options.scrollOffset else {}

    if options.windowScroll
      # Uses window as scroll wrapper
      @elementWrapper = $ document.body
      dfScroll scrollOptions
      
    else
      if not @element.children().length()
        # Just in case the inner element in the scroll is not given
        @element.append document.createElement 'div'

      @elementWrapper = @element
      @element = @element.children().first()

      # Overrides container by defined
      if options.container
        if typeof options.container is 'string'
          @element = $ options.container
        else
          @element = options.container
      dfScroll @elementWrapper, scrollOptions

  ###
  start

  This is the function where bind the
  events to DOM elements.
  ###
  init: (controller) ->
    super(controller)
    self = this
    @controller.bind 'df:search df:refresh', (params) ->
      self.elementWrapper.scrollTop(0)

  ###
  renderNext

  Appends results to the older in container
  @param {Object} res
  @api public
  ###
  renderNext: (res) ->
    @pageRequested = false
    context = extend true, res, @extraContext or {}
    context.is_first = false
    context.is_last = @controller.status.lastPageReached
    @addHelpers context
    @element.append @mustache.render(@template, context)
    @trigger("df:rendered", [res])


module.exports = ScrollDisplay
