(function() {
  var Is, hasOwn, toStr;

  Is = require("is");

  hasOwn = Object.prototype.hasOwnProperty;

  toStr = Object.prototype.toString;

  Is.window = function(value) {
    return (value != null) && typeof value === 'object' && 'setInterval' in value;
  };

  Is.document = function(value) {
    return (value != null) && typeof value.documentElement === 'object';
  };

  Is.stringArray = function(value) {
    return (Is.array(value)) && (value.every(function(x) {
      return Is.string(x);
    }));
  };

  Is.plainObject = function(obj) {
    var hasIsPrototypeOf, hasOwnConstructor, i, key, len;
    if (!obj || ((toStr.call(obj)) !== "[object Object]")) {
      return false;
    }
    hasOwnConstructor = hasOwn.call(obj, "constructor");
    hasIsPrototypeOf = obj.constructor && obj.constructor.prototype && hasOwn.call(obj.constructor.prototype, "isPrototypeOf");
    if (obj.constructor && !hasOwnConstructor && !hasIsPrototypeOf) {
      return false;
    }
    for (i = 0, len = obj.length; i < len; i++) {
      key = obj[i];
      continue;
    }
    return typeof key === "undefined" || hasOwn.call(obj, key);
  };

  module.exports = {
    "is": Is
  };

}).call(this);
