extend = require 'extend'
throttle = require './throttle'
$ = require './dfdom'
# bean = require 'bean'

module.exports = (container, options = null) ->
  if typeof container is 'string'
    container = $ container

  defaults =
    scrollOffset: 200
    content: container.children().first()
  options = extend(true, defaults, options || {})

  content = $ options.content

  container.on 'df:scroll', ->
    console.log "df:scroll!!! contentHeight(#{content.height()}) containerHeight(#{container.height()}) containerScrollTop(#{container.scrollTop()})"
    if content.height() - container.height() - container.scrollTop() <= options.scrollOffset
      # Bottom was about to be reached so we call the callback
      options.callback()

  # Throttle to avoid multiple events to be triggered.
  throttle 'scroll', 'df:scroll', container
