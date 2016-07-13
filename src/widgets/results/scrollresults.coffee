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
    

module.exports = ScrollResults
