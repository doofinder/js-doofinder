# Wraps npm "is" package, and allows using it in Coffeescript ("is" is a
# reserved word).
#
# https://www.npmjs.com/package/is

Is = require "is"

Is.window = (value) ->
  value? and typeof value is 'object' and 'setInterval' of value

Is.document = (value) ->
  value? and typeof value.documentElement is 'object'

Is.stringArray = (value) ->
  (Is.array value) and (value.every (x) -> Is.string x)

module.exports = "is": Is
