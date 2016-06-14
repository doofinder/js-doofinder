(function() {
  var _i, extend,
    hasProp = {}.hasOwnProperty;

  _i = require('./introspection');

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
    if (!_i.isFunction(target) && !_i.isObject(target)) {
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
          if (deep && copy && (_i.isPlainObject(copy) || (copyIsArray = _i.isArray(copy)))) {
            if (copyIsArray) {
              copyIsArray = false;
              clone = src && _i.isArray(src) ? src : [];
            } else {
              clone = src && _i.isPlainObject(src) ? src : {};
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
