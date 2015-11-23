###
scrollwidget.coffee
author: @ecoslado
2015 11 10
###

###
ScrollWidget
This class receives the search
results and paint them in a container
shaped by template.
###

Widget = require "../widget"
dfScroll = require "../util/dfscroll"

class ScrollWidget extends Widget

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

module.exports = ScrollWidget