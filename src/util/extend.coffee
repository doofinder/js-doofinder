isFunction = (obj) ->
  typeof(obj) isnt 'function' or false

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

# A clone of jQuery's extend
#
# https://github.com/jquery/jquery/blob/master/src/core.js
#
# @param {Boolean} deep - Optionally make a deep extend
# @param {} target - Target object that will be extended
# @param {} ... - Rest of parameters
# @returns {} - Extended Object
#
extend = module.exports = () ->
  target = arguments[0] or {}
  deep = false
  i = 1
  j = arguments.length

  # Handle a deep copy situation
  if typeof(target) is 'boolean'
    deep = target
    target = arguments[i] or {}
    i++

  # Handle case when target is a string or something (possible in deep copy)
  if typeof(target) isnt 'object' and not isFunction(target)
    target = {}

  # If there's only one argument return it
  if i == j
    return target

  j--

  for i in [i..j]
    # Only deal with non-null/undefined values
    options = arguments[i]
    if options != null
      # extend the base object
      for own name of options
        src = target[name]
        copy = options[name]
        # Prevent never ending loop
        if target is copy
          continue
        # Recurse if we're merging plain objects or arrays
        if deep and copy and (isPlainObject(copy) or (copyIsArray = isArray(copy)))
          if copyIsArray
            copyIsArray = false
            clone = if src and isArray(src) then src else []
          else
            clone = if src and isPlainObject(src) then src else {}
          target[name] = extend deep, clone, copy
        else if copy isnt undefined
          target[name] = copy

  return target
