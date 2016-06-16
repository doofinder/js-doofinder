bean = require 'bean'

module.exports = (sourceEvent, targetEvent, obj) ->
  obj = obj or window
  running = false

  bean.on obj, sourceEvent, ->
    if running
      return

    running = true

    setTimeout ->
      bean.fire obj, targetEvent
      running = false
    , 250

  bean.fire obj, targetEvent
