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
bean = require 'bean'


class ScrollResults extends ScrollDisplay
  ###
  constructor

  @param {String} element
  @param {String|Function} template
  @param {Object} extraOptions
  @api public
  ###
  constructor: (element, options = {}) ->
    if not options.template
      template = """
      <ul>
        {{#results}}
          <li>
            <b>{{title}}</b>: {{description}}
          </li>
        {{/results}}
      </ul>
      """
    else
      template = options.template

    super(element, template, options)

  ###
  init

  @api public
  ###
  init: (controller) ->
    super(controller)

    self = this
    # TODO(@carlosescri): I think this is better outside of the widget
    bean.on @element, 'click', 'a[data-df-hitcounter]', ->
      self.trigger 'df:hit', [this.getAttribute('data-dfHitcounter'), this.getAttribute('href')]

module.exports = ScrollResults
