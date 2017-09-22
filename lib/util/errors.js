(function() {
  var _msg, error, warning,
    slice = [].slice;

  _msg = function() {
    var args, msg, obj;
    args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    msg = args[0], obj = args[1];
    return "[doofinder]" + (obj != null ? "[" + obj.constructor.name + "]" : "") + ": " + msg;
  };

  error = function() {
    var args;
    args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    return new Error(_msg.apply(null, args));
  };

  warning = function() {
    var args;
    args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    if (typeof console !== "undefined" && console !== null) {
      return console.warn(_msg.apply(null, args));
    }
  };

  module.exports = {
    error: error,
    warning: warning
  };

}).call(this);
