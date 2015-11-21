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

ScrollDisplayer = require "../displayers/scrolldisplayer"
dfScroll = require "../util/dfscroll"

class InfiniteScrollWidget extends ScrollDisplayer

	constructor: (@wrapper, container, template, options) ->
		super(container, template, options)

	start: () ->
		_this = this
		dfScroll @wrapper, 
			callback: () -> 
			  _this.controller.nextPage()

		@bind 'df:search', () -> $(@container).animate({scrollTop: 0}, 'quick')	

module.exports = InfiniteScrollWidget