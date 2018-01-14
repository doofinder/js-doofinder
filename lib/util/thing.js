(function() {
  var Is;

  Is = require("is");

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

  module.exports = {
    "is": Is
  };

}).call(this);
