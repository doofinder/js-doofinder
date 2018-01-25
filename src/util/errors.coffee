###*
 * Helper to compose final error messages
 * @param  {String} text     Description of the error.
 * @param  {Object} instance Optional object instance.
 * @return {String}          Final error message.
###
_msg = (text, instance) ->
  if instance?
    "[doofinder][#{instance.constructor.name}]: #{text}"
  else
    "[doofinder]: #{text}"

error = (text, instance) ->
  new Error (_msg text, instance)

warning = (text, instance) ->
  if console?
    console.warn (_msg text, instance)

module.exports =
  error: error
  warning: warning
  requireVal: (value, varName) ->
    (throw error "#{varName} is required") unless value?
