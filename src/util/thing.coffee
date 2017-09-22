to_s = Object.prototype.toString

isObject = (value) ->
  (to_s.call value) is "[object Object]"

isFn = (value) ->
  return true if window? and value is window.alert
  (to_s.call value) is "[object Function]"

isStr = (value) ->
  (to_s.call value) is "[object String]"

isPrimitive = (value) ->
  return true if not value
  return false if (typeof value is "object") or (isObject value) or (isFn value) or (Array.isArray value)
  return true

module.exports =
  isObj: isObject
  isArray: (value) ->
    Array.isArray value
  isFn: isFn
  isStr: isStr
  isPrimitive: isPrimitive
  isPlainObj: (value) ->
    (isObject value) and
    value.constructor is Object and
    (not value.nodeType) and
    (not value.setInterval)
  isStrLiteral: (value) ->
    (isStr value) and (isPrimitive value)
  isStrArray: (value) ->
    (Array.isArray value) and (value.filter isStr).length is value.length
  isWindow: (value) ->
    value and value.document and value.location and value.alert and value.setInterval
