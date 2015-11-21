###
scrolldisplayer.coffee
author: @ecoslado
2015 11 10
###

###
ScrollDisplayer
This class receives the search
results and paint them in a container
shaped by template. When next page is
received, it append the content.
###

Displayer = require "../displayer"

class ScrollDisplayer extends Displayer

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
  renderMore

  Appends results to the older in container
  @param {Object} res
  @api public
  ###  
  renderNext: (res) ->
    html = @template res
    document.querySelector(@container).insertAdjacentHTML('beforeend', html)
    @trigger("df:results_rendered", res)

module.exports = ScrollDisplayer
