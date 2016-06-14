extend = require('./extend')
$ = require('./jquery')

dfScroll = (arg1, arg2=null) ->

  defaultOptions = 
    direction: "vertical"
    scrollOffset: 100

  # Uses window scroll
  if typeof(arg1) == 'object'
    o = arg1
    container = document.body
    content = document.documentElement
    eventTrigger = window
  
  # Uses an inner div as scroll
  else
    o = arg2
    eventTrigger = container = document.querySelector(arg1)
    content = container.children[0]

  o = extend defaultOptions, o
  
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
        event = document.createEvent 'Event'
        event.initEvent name, true, true
        obj.dispatchEvent event
        running = false

      setTimeout aux, 250
            
    obj.addEventListener type, func
    event = document.createEvent 'Event'
    event.initEvent name, true, true
    obj.dispatchEvent event
       
  throttle('scroll', 'df:scroll', eventTrigger);
  
  # handling scroll event
  handler = () ->
    # Error thrown when direction no properly configured
    if ['horizontal', 'vertical'].indexOf(o.direction) <= -1
      throw Error("Direction is not properly set. It might be 'horizontal' or 'vertical'.")
    # When bottom or right side is about to be reached, callback will be called
    if o.direction == 'vertical' and content.clientHeight - container.clientHeight - container.scrollTop <= o.scrollOffset \
    	or o.direction == "horizontal" and content.clientWidth - container.clientWidth - content.scrollLeft <= o.scrollOffset
      o.callback()
  
  eventTrigger.addEventListener 'df:scroll', handler

module.exports = dfScroll