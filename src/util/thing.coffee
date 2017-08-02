to_s = Object.prototype.toString

isObject = (value) ->
  (to_s.call value) is "[object Object]"

isArray = (value) ->
  (to_s.call value) is "[object Array]"

isFn = (value) ->
  return true if window? and value is window.alert
  (to_s.call value) is "[object Function]"

isStr = (value) ->
  (to_s.call value) is "[object String]"

isPrimitive = (value) ->
  return true if not value
  return false if (typeof value is "object") or (isObject value) or (isFn value) or (isArray value)
  return true

module.exports =
  isObj: isObject
  isArray: isArray
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
    (isArray value) and (value.filter isStr).length is value.length
  isWindow: (value) ->
    value and value.document and value.location and value.alert and value.setInterval
