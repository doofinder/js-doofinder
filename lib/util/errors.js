
/**
 * Helper to compose final error messages
 * @param  {String} text     Description of the error.
 * @param  {Object} instance Optional object instance.
 * @return {String}          Final error message.
 */

(function() {
  var _msg, error, warning;

  _msg = function(text, instance) {
    if (instance != null) {
      return "[doofinder][" + instance.constructor.name + "]: " + text;
    } else {
      return "[doofinder]: " + text;
    }
  };

  error = function(text, instance) {
    return new Error(_msg(text, instance));
  };

  warning = function(text, instance) {
    if (typeof console !== "undefined" && console !== null) {
      return console.warn(_msg(text, instance));
    }
  };

  module.exports = {
    error: error,
    warning: warning,
    requireVal: function(value, varName) {
      if (value == null) {
        throw error(varName + " is required");
      }
    }
  };

}).call(this);
