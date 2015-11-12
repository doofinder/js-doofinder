###
resultsDisplayer.coffee
author: @ecoslado
2015 11 10
###

###
ResultsDisplayer
This class receives the search
results and paint them in a container
shaped by template
###

jqDf = require("jquery")
addHelpers = require("./helpers").addHelpers

class Displayer

  ###
  ResultsDisplayer constructor
  @param {String} container
  @param {String|Function} template
  @param {Object} extraOptions 
  ###
  constructor = (container, template, extraOptions) ->
  	@container = jqDf(extraOptions.container)
  	@handlebars = require("handlebars")
  	addHelpers @handlebars,
  	  extraOptions.currency,
  	  extraOptions.templeteFunctions
  	  extraOptions.language,
  	  extraOptions.customStrings

    if template instanceof String
  	  @template = @handlebars.compile(template)
  	else if template instanceof Function
  	  @template = template
  	else
  	  throw Error "The provided template is not the right type. String or rendered handlebars expected."

    @showMode = extraOptions.showMode
    @showMode ?= "append"

    @bind "df:new_results", (res, showMode) -> 
      html = @template(res)
      showMode = showMode || @showMode
      if showMode == "append"
        @container.append html
      else
        @container.html html

  bind = (event, callback) ->
    @container.on(event, callback)

  trigger = (event, params) -> 
    @container.trigger(event, params)

module.exports = Displayer
