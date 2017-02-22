extend = require 'extend'
throttle = require './throttle'
$ = require './dfdom'
# bean = require 'bean'

module.exports = (container, options = null) ->
  if typeof container is 'string'
    container = $ container

  defaults =
    callback: ->
    scrollOffset: 200
    content: container.children().first()
  options = extend(true, defaults, options || {})

  content = $ options.content

  container.on 'df:scroll', ->
    contentHeight = content.height()
    containerHeight = container.height()
    containerScroll = container.scrollTop()
    delta = contentHeight - containerHeight - containerScroll

    if delta <= options.scrollOffset
      options.callback()

  # Avoid too much event triggering
  throttle 'scroll', 'df:scroll', container
