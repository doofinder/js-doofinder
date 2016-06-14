(function() {
  var isArray, isFunction, isObject, isPlainObject;

  isFunction = function(obj) {
    return typeof obj === 'function' || false;
  };

  isObject = function(obj) {
    var type;
    type = typeof obj;
    return type === 'function' || type === 'object' && !!obj;
  };

  isArray = Array.isArray || function(obj) {
    return toString.call(obj) === '[object Array]';
  };

  isPlainObject = function(obj) {
    var proto;
    if (typeof obj === 'object' && obj !== null) {
      if (typeof Object.getPrototypeOf === 'function') {
        proto = Object.getPrototypeOf(obj);
        return proto === Object.prototype || proto === null;
      }
      return Object.prototype.toString.call(obj) === '[object Object]';
    }
    return false;
  };

  module.exports = {
    isArray: isArray,
    isFunction: isFunction,
    isObject: isObject,
    isPlainObject: isPlainObject
  };

}).call(this);
