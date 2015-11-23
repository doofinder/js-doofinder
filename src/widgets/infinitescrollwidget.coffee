###
infinitescrollwidget.coffee
author: @ecoslado
2015 11 10
###

###
InfiniteScrollWidget
This class receives the search
results and paint them in a container
shaped by template. Ask for a new page
when scroll in wrapper reaches the
bottom
###

Widget = require "../widget"
dfScroll = require "../util/dfscroll"

class InfiniteScrollWidget extends Widget

  ###
  constructor

  just assign wrapper property for scrolling and 
  calls super constructor.
  
  @param {String} wrapper
  @param {String} container
  @param {String|Function} template
  @param {Object} extraOptions 
  @api public
  ###
  constructor: (@wrapper, container, template, options) ->
    super(container, template, options)

  start: () ->
    _this = this
    dfScroll @wrapper, 
      callback: () -> 
        _this.controller.nextPage()

    @bind 'df:search', () -> document.querySelector(_this.wrapper).scrollTop = 0

  ###
  render

  Replaces the older results in container with
  the given

  @param {Object} res
  @api public
  ###  
  render: (res) ->
    html = @template res
    document.querySelector(@container).innerHTML = html
    @trigger("df:results_rendered", res)

  ###
  renderNext

  Appends results to the older in container
  @param {Object} res
  @api public
  ###  
  renderNext: (res) ->
    html = @template res
    document.querySelector(@container).insertAdjacentHTML('beforeend', html)
    @trigger("df:results_rendered", res)  

module.exports = InfiniteScrollWidget