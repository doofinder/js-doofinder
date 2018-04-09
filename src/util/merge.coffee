Thing = require "./thing"

###*
 * Heavily based on https://www.npmjs.com/package/extend.
 *
 * While extend() fully extends objects, this version only touches own
 * properties and not inherited ones. This is intended to extend only option
 * objects, not functions used as constructors or anything like that.
 *
 * Why? Try to use PrototypeJS in the same page as Doofinder and use extend
 * instead to have some fun debugging.
 *
 * Works the same as extend, but merge is always "deep"
###
merge = ->
  target = arguments[0]
  length = arguments.length

  if target == null or (typeof target isnt 'object' and typeof target isnt 'function')
    target = {}

  for x in [1..length]
    obj = arguments[x]
    if obj?
      for own propName, propValue of obj
        src = target[propName]
        if target isnt propValue
          if propValue and ((Thing.is.hash propValue) or (propValueIsArray = Thing.is.array propValue))
            if propValueIsArray
              propValueIsArray = false
              clone = if src and Thing.is.array src then src else []
            else
              clone = if src and Thing.is.hash src then src else {}
            target[propName] = merge clone, propValue
          else unless Thing.is.undef propValue
            target[propName] = propValue

  target

module.exports = merge
