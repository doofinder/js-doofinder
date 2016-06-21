_i = require './introspection'

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
  if not _i.isFunction(target) and not _i.isObject(target)
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
        if deep and copy and (_i.isPlainObject(copy) or (copyIsArray = _i.isArray(copy)))
          if copyIsArray
            copyIsArray = false
            clone = if src and _i.isArray(src) then src else []
          else
            clone = if src and _i.isPlainObject(src) then src else {}
          target[name] = extend deep, clone, copy
        else if copy isnt undefined
          target[name] = copy

  return target
