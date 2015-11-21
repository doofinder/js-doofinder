extend = require('./extend').extend

dfScroll = (container, o) ->

  defaultOptions = 
    direction: "vertical"
    scrollOffset: 50

  o = extend o, defaultOptions
  container = document.querySelector(container)
  content = container.children[0]	
  	
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
       
  throttle('scroll', 'df:scroll', container);
  
  # handling scroll event
  handler = () ->
    # When bottom or right side is about to be reached, callback will be called
    if ['horizontal', 'vertical'].indexOf(o.direction) <= -1
      throw Error("Direction is not properly set. It might be 'horizontal' or 'vertical'.")

    if o.direction == 'vertical' and content.clientHeight - container.clientHeight - container.scrollTop <= o.scrollOffset \
    	or o.direction == "horizontal" and content.clientWidth() - container.clientWidth() - content.scrollLeft <= o.scrollOffset
      o.callback()
  
  container.addEventListener 'df:scroll', handler

module.exports = dfScroll