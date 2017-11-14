Is = require "is"

Is.window = (value) ->
  value? and typeof value is 'object' and 'setInterval' of value

Is.document = (value) ->
  value? and typeof value.documentElement is 'object'

module.exports = "is": Is
