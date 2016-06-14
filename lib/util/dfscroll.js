(function() {
  var $, dfScroll, extend, introspection;

  extend = require('./extend');

  introspection = require('./introspection');

  $ = require('./jquery');

  dfScroll = function(arg1, arg2) {
    var container, content, defaults, eventTrigger, handler, options, throttle;
    if (arg2 == null) {
      arg2 = null;
    }
    defaults = {
      direction: "vertical",
      scrollOffset: 100
    };
    if (introspection.isPlainObject(arg1)) {
      options = arg1;
      container = document.body;
      content = document.documentElement;
      eventTrigger = window;
    } else {
      options = arg2;
      if (typeof arg1 === 'string') {
        container = document.querySelector(arg1);
      } else {
        container = arg1;
      }
      content = container.children[0];
      eventTrigger = container;
    }
    options = extend(true, defaults, options);
    throttle = function(type, name, obj) {
      var event, func, running;
      obj = obj || window;
      running = false;
      func = function() {
        var aux;
        if (running) {
          return;
        }
        running = true;
        aux = function() {
          var event;
          event = document.createEvent('Event');
          event.initEvent(name, true, true);
          obj.dispatchEvent(event);
          return running = false;
        };
        return setTimeout(aux, 250);
      };
      obj.addEventListener(type, func);
      event = document.createEvent('Event');
      event.initEvent(name, true, true);
      return obj.dispatchEvent(event);
    };
    throttle('scroll', 'df:scroll', eventTrigger);
    handler = function() {
      if (['horizontal', 'vertical'].indexOf(options.direction) <= -1) {
        throw Error("[Doofinder] dfScroll: Direction is not properly set. It might be 'horizontal' or 'vertical'.");
      }
      if (options.direction === 'vertical' && content.clientHeight - container.clientHeight - container.scrollTop <= options.scrollOffset || options.direction === "horizontal" && content.clientWidth - container.clientWidth - content.scrollLeft <= options.scrollOffset) {
        return options.callback();
      }
    };
    return eventTrigger.addEventListener('df:scroll', handler);
  };

  module.exports = dfScroll;

}).call(this);
