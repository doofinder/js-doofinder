Thing = require "./thing"

###*
 * Recursively freezes an object so it can't be modified in any way (adding or
 * removing properties, and so on).
 *
 * @param  {*} value Any object or primitive
 * @return {*}       Freezed value.
###
freeze = (value) ->
  (Object.getOwnPropertyNames value).forEach (propertyName) ->
    if (Thing.isObj value) and (value[propertyName] isnt null) and
        not (Object.isFrozen value[propertyName])
      freeze value[propertyName]
  Object.freeze value
  value

###*
 * Freezes a property of an Object so it can't be modified.
 *
 * @param  {Object} instance      An object's instance.
 * @param  {String} propertyName  A property name.
 * @param  {*}      propertyValue An optional value. If not set the current
 *                                value is used.
 * @return {Object}               The passed instance.
###
freezeProperty = (instance, propertyName, propertyValue) ->
  propertyValue ?= instance[propertyName]
  descriptor =
    value: propertyValue
    configurable: false
    enumerable: false
    writable: false
  freeze propertyValue
  Object.defineProperty instance, propertyName, descriptor
  instance


module.exports =
  freeze: freeze
  freezeProperty: freezeProperty
