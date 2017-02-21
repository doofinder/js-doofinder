(function() {
  var $, bean;

  $ = require('./dfdom');

  bean = require('bean');

  module.exports = function(sourceEvent, targetEvent, obj) {
    var running;
    obj = obj || window;
    running = false;
    if (obj !== window) {
      return obj.on(sourceEvent, function() {
        if (!running) {
          requestAnimationFrame(function() {
            obj.trigger(targetEvent);
            return running = false;
          });
        }
        return running = true;
      });
    } else {
      return bean.on(obj, sourceEvent, function() {
        if (!running) {
          bean.fire(obj, targetEvent);
          running = false;
        }
        return running = true;
      });
    }
  };

}).call(this);
