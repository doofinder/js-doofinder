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
$ = require "../util/jquery"

class ScrollDisplay extends Display

  ###
  constructor

  just assign wrapper property for scrolling and 
  calls super constructor.
  
  @param {String} scrollWrapper
  @param {String|Function} template
  @param {Object} extraOptions 
  @api public
  ###
  constructor: (@scrollWrapper, template, options) ->
    scrollWrapperElement = $(@scrollWrapper)
    @scrollOptions = options.scrollOptions

    if scrollWrapperElement.children().length and not scrollWrapperElement.children().first().attr "id"
        scrollWrapperElement.children().first().attr "id", "df-scroll__container"

    else if not scrollWrapperElement.children().length 
      # Just in case the inner element in the scroll is not given
      $(@scrollWrapper).prepend '<div id="df-scroll__container"></div>'
        
    container = "##{scrollWrapperElement.children().first().attr('id')}"
    
    # Overrides container by defined
    if options.container
      container = options.container
    super(container, template, options)

  ###
  start

  This is the function where bind the
  events to DOM elements.
  ###
  init: (controller) ->
    @controller = controller
    _this = this
    options = $.extend true,
      callback: () -> _this.controller.nextPage.call(_this.controller),
      @scrollOptions || {}

    dfScroll @scrollWrapper, options

    # @bind('df:search', () -> $(_this.scrollWrapper).animate({scrollTop: 0}, "quick"))


  ###
  renderNext

  Appends results to the older in container
  @param {Object} res
  @api public
  ###  
  renderNext: (res) ->
    console.log "RENDERNEXT SCROLL DISPLAY"
    html = @template res
    $(@container).append html
    

module.exports = ScrollDisplay