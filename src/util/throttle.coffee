$ = require './dfdom'
bean = require 'bean'

module.exports = (sourceEvent, targetEvent, obj) ->
  obj = obj or window
  running = false
  if obj != window
    obj.on sourceEvent, ->
      if running
        return

      running = true

      setTimeout ->
        obj.trigger targetEvent
        running = false
      , 250
  else
    bean.on obj, sourceEvent, ->
      if running
        return
      running = true
      setTimeout ->
        bean.fire obj, targetEvent
        running = false
      , 250
