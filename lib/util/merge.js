(function() {
  var Thing, merge,
    hasProp = {}.hasOwnProperty;

  Thing = require("./thing");


  /**
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
   */

  merge = function() {
    var clone, i, length, obj, propName, propValue, propValueIsArray, ref, src, target, x;
    target = arguments[0];
    length = arguments.length;
    if (target === null || (typeof target !== 'object' && typeof target !== 'function')) {
      target = {};
    }
    for (x = i = 1, ref = length; 1 <= ref ? i <= ref : i >= ref; x = 1 <= ref ? ++i : --i) {
      obj = arguments[x];
      if (obj != null) {
        for (propName in obj) {
          if (!hasProp.call(obj, propName)) continue;
          propValue = obj[propName];
          src = target[propName];
          if (target !== propValue) {
            if (propValue && ((Thing.is.hash(propValue)) || (propValueIsArray = Thing.is.array(propValue)))) {
              if (propValueIsArray) {
                propValueIsArray = false;
                clone = src && Thing.is.array(src) ? src : [];
              } else {
                clone = src && Thing.is.hash(src) ? src : {};
              }
              target[propName] = merge(clone, propValue);
            } else if (!Thing.is.undef(propValue)) {
              target[propName] = propValue;
            }
          }
        }
      }
    }
    return target;
  };

  module.exports = merge;

}).call(this);
