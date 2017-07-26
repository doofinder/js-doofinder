to_s = Object.prototype.toString

isObject = (value) ->
  (to_s.call value) is "[object Object]"

isArray = (value) ->
  (to_s.call value) is "[object Array]"

isFunction = (value) ->
  return true if window? and value is window.alert
  (to_s.call value) is "[object Function]"

isString = (value) ->
  (to_s.call value) is "[object String]"

isPrimitive = (value) ->
  return true if not value
  return false if (typeof value is "object") or (isObject value) or (isFunction value) or (isArray value)
  return true

module.exports =
  isObj: isObject
  isArray: isArray
  isFn: isFunction
  isStr: isString
  isPrimitive: isPrimitive
  isPlainObj: (value) ->
    (isObject value) and
    value.constructor is Object and
    (not value.nodeType) and
    (not value.setInterval)
  isStrLiteral: (value) ->
    (isString value) and (isPrimitive value)
  isWindow: (value) ->
    value and value.document and value.location and value.alert and value.setInterval
