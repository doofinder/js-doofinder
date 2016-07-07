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
        if (running) {
          return;
        }
        running = true;
        return setTimeout(function() {
          obj.trigger(targetEvent);
          return running = false;
        }, 250);
      });
    } else {
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
    }
  };

}).call(this);
