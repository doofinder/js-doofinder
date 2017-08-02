(function() {
  var isArray, isFn, isObject, isPrimitive, isStr, to_s;

  to_s = Object.prototype.toString;

  isObject = function(value) {
    return (to_s.call(value)) === "[object Object]";
  };

  isArray = function(value) {
    return (to_s.call(value)) === "[object Array]";
  };

  isFn = function(value) {
    if ((typeof window !== "undefined" && window !== null) && value === window.alert) {
      return true;
    }
    return (to_s.call(value)) === "[object Function]";
  };

  isStr = function(value) {
    return (to_s.call(value)) === "[object String]";
  };

  isPrimitive = function(value) {
    if (!value) {
      return true;
    }
    if ((typeof value === "object") || (isObject(value)) || (isFn(value)) || (isArray(value))) {
      return false;
    }
    return true;
  };

  module.exports = {
    isObj: isObject,
    isArray: isArray,
    isFn: isFn,
    isStr: isStr,
    isPrimitive: isPrimitive,
    isPlainObj: function(value) {
      return (isObject(value)) && value.constructor === Object && (!value.nodeType) && (!value.setInterval);
    },
    isStrLiteral: function(value) {
      return (isStr(value)) && (isPrimitive(value));
    },
    isStrArray: function(value) {
      return (isArray(value)) && (value.filter(isStr)).length === value.length;
    },
    isWindow: function(value) {
      return value && value.document && value.location && value.alert && value.setInterval;
    }
  };

}).call(this);
