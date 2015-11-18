###
resultsdisplayer.coffee
author: @ecoslado
2015 11 10
###

###
Displayer
This class receives the search
results and paint them in a container
shaped by template
###

Displayer = require "./displayer"

class ResultsDisplayer extends Displayer

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


  ###
  renderMore

  Appends results to the older in container
  @param {Object} res
  @api public
  ###  
  renderNext: (res) ->
    html = @template res
    document.querySelector(@container).insertAdjacentHTML('beforeend', html)

module.exports = ResultsDisplayer
