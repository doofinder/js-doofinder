$ = require './jquery'

dfScroll = (arg1, arg2=null) ->

  # Uses window scroll
  if not arg2
    o = arg1
    container = $ window
    content = $ document
  
  # Uses an inner div as scroll
  else
    o = arg2
    container = $ arg1
    content = container.children().first()

  defaultOptions =
    direction: 'vertical'
    scrollOffset: 100

  o = $.extend true,
    defaultOptions, 
    o || {}
  

  # Throttle to avoid multiple events
  # to be triggered.
  throttle = (type, name, obj) ->
    obj = obj || window
    running = false
    func = () ->
      if running
        return
                
      running = true
      
      aux = () -> 
        obj.trigger name
        running = false

      setTimeout aux, 250
            
    obj.on type, func
    obj.trigger name
       
  throttle('scroll', 'df:scroll', container);
  
  # handling scroll event
  handler = () ->
  
    if o.direction == 'vertical'
      # When bottom is about to be reached, callback will be called
      if container.scrollTop() + container.height() >= content.height() - o.scrollOffset
        o.callback()
    else
      # When right edge is about to be reached, callback will be called
      if container.scrollLeft() + container.width() >= content.width() - o.scrollOffset
        o.callback()
  
  container.on 'df:scroll', handler

module.exports = dfScroll