(function() {
  var $, dfScroll;

  $ = require('./jquery');

  dfScroll = function(arg1, arg2) {
    var container, content, defaultOptions, handler, o, throttle;
    if (arg2 == null) {
      arg2 = null;
    }
    if (!arg2) {
      o = arg1;
      container = $(window);
      content = $(document);
    } else {
      o = arg2;
      container = $(arg1);
      content = container.children().first();
    }
    defaultOptions = {
      direction: 'vertical',
      scrollOffset: 100
    };
    o = $.extend(true, defaultOptions, o || {});
    throttle = function(type, name, obj) {
      var func, running;
      obj = obj || window;
      running = false;
      func = function() {
        var aux;
        if (running) {
          return;
        }
        running = true;
        aux = function() {
          obj.trigger(name);
          return running = false;
        };
        return setTimeout(aux, 250);
      };
      obj.on(type, func);
      return obj.trigger(name);
    };
    throttle('scroll', 'df:scroll', container);
    handler = function() {
      if (o.direction === 'vertical') {
        if (container.scrollTop() + container.height() >= content.height() - o.scrollOffset) {
          return o.callback();
        }
      } else {
        if (container.scrollLeft() + container.width() >= content.width() - o.scrollOffset) {
          return o.callback();
        }
      }
    };
    return container.on('df:scroll', handler);
  };

  module.exports = dfScroll;

}).call(this);
