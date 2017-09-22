_msg = (args...) ->
  [msg, obj] = args
  "[doofinder]#{if obj? then "[#{obj.constructor.name}]" else ""}: #{msg}"

error = (args...) ->
  new Error _msg args...

warning = (args...) ->
  if console?
    console.warn _msg args...


module.exports =
  error: error
  warning: warning
