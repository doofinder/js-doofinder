(function() {
  var extend, isArray, isFunction, isPlainObject,
    hasProp = {}.hasOwnProperty;

  isFunction = function(obj) {
    return typeof obj !== 'function' || false;
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

  extend = module.exports = function() {
    var clone, copy, copyIsArray, deep, i, j, k, name, options, ref, ref1, src, target;
    target = arguments[0] || {};
    deep = false;
    i = 1;
    j = arguments.length;
    if (typeof target === 'boolean') {
      deep = target;
      target = arguments[i] || {};
      i++;
    }
    if (typeof target !== 'object' && !isFunction(target)) {
      target = {};
    }
    if (i === j) {
      return target;
    }
    j--;
    for (i = k = ref = i, ref1 = j; ref <= ref1 ? k <= ref1 : k >= ref1; i = ref <= ref1 ? ++k : --k) {
      options = arguments[i];
      if (options !== null) {
        for (name in options) {
          if (!hasProp.call(options, name)) continue;
          src = target[name];
          copy = options[name];
          if (target === copy) {
            continue;
          }
          if (deep && copy && (isPlainObject(copy) || (copyIsArray = isArray(copy)))) {
            if (copyIsArray) {
              copyIsArray = false;
              clone = src && isArray(src) ? src : [];
            } else {
              clone = src && isPlainObject(src) ? src : {};
            }
            target[name] = extend(deep, clone, copy);
          } else if (copy !== void 0) {
            target[name] = copy;
          }
        }
      }
    }
    return target;
  };

}).call(this);
