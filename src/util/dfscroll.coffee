extend = require './extend'
introspection = require './introspection'
throttle = require './throttle'
bean = require 'bean'

module.exports = (arg1, arg2 = null) ->
  defaults =
    direction: "vertical"
    scrollOffset: 100

  if introspection.isPlainObject arg1
    # if typeof arg1 is 'object'
    # First parameter is an options object, uses window scroll
    options = arg1
    container = document.body
    content = document.documentElement
    wrapper = window
  else
    # Uses an inner div as scroll
    options = arg2
    if typeof arg1 is 'string'
      container = document.querySelector arg1
    else
      container = arg1
    content = container.children[0]
    wrapper = container

  options = extend true, defaults, options

  # Throttle to avoid multiple events to be triggered.
  throttle 'scroll', 'df:scroll', wrapper

  bean.on wrapper, 'df:scroll', ->
    if ['horizontal', 'vertical'].indexOf(options.direction) <= -1
      throw Error("[Doofinder] dfScroll: Direction is not properly set. It might be 'horizontal' or 'vertical'.")
    if options.direction == 'vertical' and content.clientHeight - container.clientHeight - container.scrollTop <= options.scrollOffset or
        options.direction == "horizontal" and content.clientWidth - container.clientWidth - content.scrollLeft <= options.scrollOffset
      # Bottom or right side was about to be reached so we call the callback
      options.callback()
