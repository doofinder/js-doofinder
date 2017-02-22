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

  options =
    scrollOffset: 200
    contentNode: "Node that holds the results => this.element"
    contentWrapper: "Node that is used for the scroll instead of the first "
                    "child of the container"
  @api public
  ###
  constructor: (element, template, options) ->
    super
    self = this
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
      ,
      if options.contentWrapper? then content: $ options.contentWrapper else {}

    @elementWrapper = @element

    if options.contentNode?
      @element = $ options.contentNode
    else
      if not @element.children().length()
        @element.append (document.createElement 'div')
      @element = @element.children().first()

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
