(function() {
  var $, dfScroll, extend;

  extend = require('./extend');

  $ = require('./jquery');

  dfScroll = function(arg1, arg2) {
    var container, content, defaultOptions, eventTrigger, handler, o, throttle;
    if (arg2 == null) {
      arg2 = null;
    }
    defaultOptions = {
      direction: "vertical",
      scrollOffset: 100
    };
    if (typeof arg1 === 'object') {
      o = arg1;
      container = document.body;
      content = document.documentElement;
      eventTrigger = window;
    } else {
      o = arg2;
      eventTrigger = container = document.querySelector(arg1);
      content = container.children[0];
    }
    o = extend(defaultOptions, o);
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
      if (['horizontal', 'vertical'].indexOf(o.direction) <= -1) {
        throw Error("Direction is not properly set. It might be 'horizontal' or 'vertical'.");
      }
      if (o.direction === 'vertical' && content.clientHeight - container.clientHeight - container.scrollTop <= o.scrollOffset || o.direction === "horizontal" && content.clientWidth - container.clientWidth - content.scrollLeft <= o.scrollOffset) {
        return o.callback();
      }
    };
    return eventTrigger.addEventListener('df:scroll', handler);
  };

  module.exports = dfScroll;

}).call(this);
