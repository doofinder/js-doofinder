###
display.coffee
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

Display = require '../display'

class Results extends Display
  ###
  constructor

  @param {String} container
  @param {String|Function} template
  @param {Object} extraOptions 
  @api public
  ###
  constructor: (container, options = {}) ->
  	if not options.template
  	  template = '<ul>{{#each results}}' +
        '            <li>{{#each this}}' +
        '               <b>{{@key}}</b>:{{this}}<br></li>' +
        '               {{/each}}</div>' +
        '            {{/each}}' +
        '         </ul>'
    else
      template = options.template
  	super(container, template, options)



module.exports = Results