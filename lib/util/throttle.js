(function() {
  var bean;

  bean = require('bean');

  module.exports = function(sourceEvent, targetEvent, obj) {
    var running;
    obj = obj || window;
    running = false;
    return bean.on(obj, sourceEvent, function() {
      if (running) {
        return;
      }
      running = true;
      return setTimeout(function() {
        bean.fire(obj, targetEvent);
        return running = false;
      }, 250);
    });
  };

}).call(this);
