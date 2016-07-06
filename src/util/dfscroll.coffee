extend = require 'extend'
introspection = require './introspection'
throttle = require './throttle'
dimensions = require './dimensions'
$ = require './dfdom'
bean = require 'bean'

module.exports = (arg1, arg2 = null) ->
  defaults =
    direction: "vertical"
    scrollOffset: 200

  if introspection.isPlainObject arg1
    # if typeof arg1 is 'object'
    # First parameter is an options object, uses window scroll
    
    options = extend true, defaults, arg1
    content = document
    container = window
    console.log bean.on
    bean.on container, 'df:scroll', ->
      if ['horizontal', 'vertical'].indexOf(options.direction) <= -1
        throw Error("[Doofinder] dfScroll: Direction is not properly set. It might be 'horizontal' or 'vertical'.")
      
      if options.direction == 'vertical' and window.innerHeight + window.scrollY + options.scrollOffset >= dimensions.clientHeight(content) or
          options.direction == "horizontal" and window.innerWidth + window.scrollX + options.scrollOffset >= dimensions.clientWidth(content)
        # Bottom or right side was about to be reached so we call the callback
        options.callback()
  else
    # Uses an inner div as scroll
    options = extend true, defaults, arg2
    if typeof arg1 is 'string'
      container = $ arg1
    else
      container = arg1

    content = container.children().first()
    container.on 'df:scroll', ->
      if ['horizontal', 'vertical'].indexOf(options.direction) <= -1
        throw Error("[Doofinder] dfScroll: Direction is not properly set. It might be 'horizontal' or 'vertical'.")

      if options.direction == 'vertical' and content.height() - container.height() - container.scrollTop() <= options.scrollOffset or
          options.direction == "horizontal" and content.width() - container.width() - container.scrollLeft() <= options.scrollOffset
        # Bottom or right side was about to be reached so we call the callback
        options.callback()


  # Throttle to avoid multiple events to be triggered.
  throttle 'scroll', 'df:scroll', container
