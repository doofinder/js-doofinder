(function() {
  var extend, isArray,
    slice = [].slice,
    hasProp = {}.hasOwnProperty;

  isArray = Array.isArray || function(obj) {
    return toString.call(obj) === '[object Array]';
  };

  extend = function() {
    var attr, deep, i, len, obj, objects, target, value;
    target = arguments[0], objects = 2 <= arguments.length ? slice.call(arguments, 1) : [];
    deep = false;
    if (typeof target === 'boolean') {
      deep = target;
      target = objects[0] || {};
      objects = objects.slice(1);
    }
    for (i = 0, len = objects.length; i < len; i++) {
      obj = objects[i];
      if (!obj) {
        continue;
      }
      for (attr in obj) {
        if (!hasProp.call(obj, attr)) continue;
        value = obj[attr];
        if (typeof value === 'object' && !!value && deep === true && !isArray(value)) {
          target[attr] = extend(true, target[attr], value);
        } else {
          target[attr] = value;
        }
      }
    }
    return target;
  };

  module.exports = {
    extend: extend
  };

}).call(this);
