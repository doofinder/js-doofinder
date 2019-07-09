# Wraps npm "is" package, and allows using it in Coffeescript ("is" is a
# reserved word).
#
# https://www.npmjs.com/package/is

Is = require "is"

hasOwn = Object.prototype.hasOwnProperty
toStr = Object.prototype.toString

Is.window = (value) ->
  value? and typeof value is 'object' and 'setInterval' of value

Is.document = (value) ->
  value? and typeof value.documentElement is 'object'

Is.stringArray = (value) ->
  (Is.array value) and (value.every (x) -> Is.string x)

Is.svgElement = (value) ->
  value? and typeof SVGElement isnt 'undefined' and value instanceof SVGElement and value.nodeType is 1;

# Ported from https://www.npmjs.com/package/extend.
Is.plainObject = (obj) ->
  if not obj or ((toStr.call obj) isnt "[object Object]")
    return false

  hasOwnConstructor = hasOwn.call obj, "constructor"
  hasIsPrototypeOf = obj.constructor and obj.constructor.prototype and hasOwn.call obj.constructor.prototype, "isPrototypeOf"

  # Not own constructor property must be Object
  if obj.constructor and not hasOwnConstructor and not hasIsPrototypeOf
	  return false

  # Own properties are enumerated firstly, so to speed up,
  # if last one is own, then all properties are own.
  continue for key in obj

  typeof key is "undefined" or hasOwn.call obj, key

module.exports = "is": Is
