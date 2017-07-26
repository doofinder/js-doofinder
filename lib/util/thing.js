(function() {
  var isArray, isFunction, isObject, isPrimitive, isString, to_s;

  to_s = Object.prototype.toString;

  isObject = function(value) {
    return (to_s.call(value)) === "[object Object]";
  };

  isArray = function(value) {
    return (to_s.call(value)) === "[object Array]";
  };

  isFunction = function(value) {
    if ((typeof window !== "undefined" && window !== null) && value === window.alert) {
      return true;
    }
    return (to_s.call(value)) === "[object Function]";
  };

  isString = function(value) {
    return (to_s.call(value)) === "[object String]";
  };

  isPrimitive = function(value) {
    if (!value) {
      return true;
    }
    if ((typeof value === "object") || (isObject(value)) || (isFunction(value)) || (isArray(value))) {
      return false;
    }
    return true;
  };

  module.exports = {
    isObj: isObject,
    isArray: isArray,
    isFn: isFunction,
    isStr: isString,
    isPrimitive: isPrimitive,
    isPlainObj: function(value) {
      return (isObject(value)) && value.constructor === Object && (!value.nodeType) && (!value.setInterval);
    },
    isStrLiteral: function(value) {
      return (isString(value)) && (isPrimitive(value));
    },
    isWindow: function(value) {
      return value && value.document && value.location && value.alert && value.setInterval;
    }
  };

}).call(this);
