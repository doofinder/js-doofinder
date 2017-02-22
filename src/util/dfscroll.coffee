extend = require 'extend'
throttle = require './throttle'
$ = require './dfdom'
# bean = require 'bean'

module.exports = (container, options = null) ->
  if typeof container is 'string'
    container = $ container

  defaults =
    # callback: ->
    scrollOffset: 200
    content: container.children().first()
  options = extend(true, defaults, options || {})

  content = $ options.content

  console.log "scrollOffset: #{options.scrollOffset}"

  container.on 'df:scroll', ->
    contentHeight = content.height()
    containerHeight = container.height()
    containerScroll = container.scrollTop()
    delta = contentHeight - containerHeight - containerScroll

    console.log "df:scroll!!! contentHeight(#{contentHeight})"
    console.log "df:scroll!!! containerHeight(#{containerHeight})"
    console.log "df:scroll!!! containerScrollTop(#{containerScroll})"
    console.log "df:scroll!!! delta(#{delta})"

    if delta <= options.scrollOffset
      console.log "callback()"
      # Bottom was about to be reached so we call the callback
      options.callback()

  # Throttle to avoid multiple events to be triggered.
  throttle 'scroll', 'df:scroll', container
