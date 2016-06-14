extend = require './extend'
introspection = require './introspection'

dfScroll = (arg1, arg2=null) ->

  defaults =
    direction: "vertical"
    scrollOffset: 100

  if introspection.isPlainObject arg1
    # if typeof arg1 is 'object'
    # First parameter is an options object, uses window scroll
    options = arg1
    container = document.body
    content = document.documentElement
    eventTrigger = window

  else
    # Uses an inner div as scroll
    options = arg2
    if typeof arg1 is 'string'
      container = document.querySelector arg1
    else
      container = arg1
    content = container.children[0]
    eventTrigger = container

  options = extend true, defaults, options

  # Throttle to avoid multiple events to be triggered.
  throttle = (type, name, obj) ->
    obj = obj or window
    running = false
    func = ->
      if running
        return

      running = true

      aux = ->
        event = document.createEvent 'Event'
        event.initEvent name, true, true
        obj.dispatchEvent event
        running = false

      setTimeout aux, 250

    obj.addEventListener type, func
    event = document.createEvent 'Event'
    event.initEvent name, true, true
    obj.dispatchEvent event

  throttle 'scroll', 'df:scroll', eventTrigger

  # handling scroll event
  handler = ->
    # Error thrown when direction no properly configured
    if ['horizontal', 'vertical'].indexOf(options.direction) <= -1
      throw Error("[Doofinder] dfScroll: Direction is not properly set. It might be 'horizontal' or 'vertical'.")
    # When bottom or right side is about to be reached, callback will be called
    if options.direction == 'vertical' and content.clientHeight - container.clientHeight - container.scrollTop <= options.scrollOffset or
        options.direction == "horizontal" and content.clientWidth - container.clientWidth - content.scrollLeft <= options.scrollOffset
      options.callback()

  eventTrigger.addEventListener 'df:scroll', handler

module.exports = dfScroll
