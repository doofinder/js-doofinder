isArray = Array.isArray or (obj) ->
  toString.call(obj) is '[object Array]'

extend = (target, objects...) ->
  deep = false
  if typeof(target) is 'boolean'
    deep = target
    target = objects[0] or {}
    objects = objects[1..]

  for obj in objects
    if not obj
      continue
    for own attr, value of obj
      if typeof(value) is 'object' and !!value and deep is true and not isArray(value)
        target[attr] = extend true, target[attr], value
      else
        target[attr] = value
  return target

module.exports =
  extend: extend
