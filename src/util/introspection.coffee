isFunction = (obj) ->
  typeof obj is 'function' or false

isObject = (obj) ->
  type = typeof obj
  type is 'function' or type is 'object' and !!obj

isArray = Array.isArray or (obj) ->
  toString.call(obj) is '[object Array]'

#  Function to test if an object is a plain object, i.e. is constructed
#  by the built-in Object constructor and inherits directly from Object.prototype
#  or null. Some built-in objects pass the test, e.g. Math which is a plain object
#  and some host or exotic objects may pass also.
#
#  http://stackoverflow.com/a/5878101
#
#  @param {} obj - value to test
#  @returns {Boolean} true if passes tests, false otherwise
#
isPlainObject = (obj) ->
  # Basic check for Type object that's not null
  if typeof obj is 'object' and obj isnt null

    # If Object.getPrototypeOf supported, use it
    if typeof Object.getPrototypeOf is 'function'
      proto = Object.getPrototypeOf obj
      return proto is Object.prototype or proto is null

    # Otherwise, use internal class
    # This should be reliable as if getPrototypeOf not supported, is pre-ES5
    return Object.prototype.toString.call(obj) == '[object Object]'

  # Not an object
  return false

module.exports =
  isArray: isArray
  isFunction: isFunction
  isObject: isObject
  isPlainObject: isPlainObject
