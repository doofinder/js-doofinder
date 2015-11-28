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
    
    if scrollWrapperElement.children() and scrollWrapperElement.children().first()
      if not scrollWrapperElement.children().first().attr "id"
        scrollWrapperElement.children().first().attr "id", "df-scroll__container"

    else
      # Just in case the inner element in the scroll is not given
      $(@scrollWrapper).prepend '<div id="df-scroll__container"></div>'
        

    container = "##{scrollWrapperElement.children().first().attr('id')}"
    super(container, template, options)

  ###
  start

  This is the function where bind the
  events to DOM elements.
  ###
  start: () ->
    _this = this
    $(@scrollWrapper).dfScroll
      callback: () -> 
        _this.controller.nextPage()

    @bind('df:search', () -> $(_this.scrollWrapper).animate({scrollTop: 0}, "quick"))


  ###
  renderNext

  Appends results to the older in container
  @param {Object} res
  @api public
  ###  
  renderNext: (res) ->
    html = @template res
    try
      $(@container).append html
    catch
      throw Error "widget.ResultsScroll: Error while rendering. " + 
        "The container you are trying to access does not already exist."
    


module.exports = ScrollDisplay