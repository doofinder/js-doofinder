$ = require './dfdom'
bean = require 'bean'

module.exports = (sourceEvent, targetEvent, obj) ->
  obj = obj or window
  running = false
  if obj != window
    obj.on sourceEvent, ->
      if not running
        requestAnimationFrame ->
          obj.trigger targetEvent
          running = false
      running = true
  else
    bean.on obj, sourceEvent, ->
      if not running
        bean.fire obj, targetEvent
        running = false
      running = true
