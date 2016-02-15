###
scrollresults.coffee
author: @ecoslado
2015 11 10
###

###
Display
This class receives the search
results and paint them in a container
shaped by template. Every new page
replaces the current content.
###

ScrollDisplay = require '../scrolldisplay'
$ = require '../../util/jquery'

class ScrollResults extends ScrollDisplay
  ###
  constructor

  @param {String} container
  @param {String|Function} template
  @param {Object} extraOptions 
  @api public
  ###
  constructor: (container, options = {}) ->
    if not options.template
      template = '<ul>{{#results}}{{@index}}<li><b>{{title}}</b>:{{description}}<br></li>{{/results}}</ul>'
    else
      template = options.template
    super(container, template, options)

  ###
  init

  @api public
  ###  
  init: (controller) ->
    super(controller)
    _this = this
    $(@container).on 'click', 'a[data-df-hitcounter]', (e) ->
      _this.trigger 'df:hit', [$(this).data('dfHitcounter'), $(this).attr('href')]
    

  ###
  render

  just inherits render method and triggers
  df:results_rendered

  @param {Object} res
  @api public
  ###
  render: (res) ->
    context = $.extend true, 
      res, 
      @extraContext || {}

    super(res)
    @trigger("df:rendered", res)

  ###
  renderNext

  just inherits render method and triggers
  df:results_rendered

  @param {Object} res
  @api public
  ###
  renderNext: (res) ->
    super(res)
    @trigger("df:rendered", res)

module.exports = ScrollResults