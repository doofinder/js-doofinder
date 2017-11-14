(function() {
  var Is;

  Is = require("is");

  Is.window = function(value) {
    return (value != null) && typeof value === 'object' && 'setInterval' in value;
  };

  Is.document = function(value) {
    return (value != null) && typeof value.documentElement === 'object';
  };

  module.exports = {
    "is": Is
  };

}).call(this);
