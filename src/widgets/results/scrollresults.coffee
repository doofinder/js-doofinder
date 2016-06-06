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
      template = """
      {{#results}}
        {{@index}}
        <div>
          <b>{{title}}</b>
          <div>{{description}}</div>
        </div>
      {{/results}}
      """
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


module.exports = ScrollResults
