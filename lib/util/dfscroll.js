(function() {
  var dfScroll, extend;

  extend = require('./extend').extend;

  dfScroll = function(container, o) {
    var content, defaultOptions, handler, throttle;
    defaultOptions = {
      direction: "vertical",
      scrollOffset: 100
    };
    o = extend(defaultOptions, o);
    container = document.querySelector(container);
    content = container.children[0];
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
    throttle('scroll', 'df:scroll', container);
    handler = function() {
      if (['horizontal', 'vertical'].indexOf(o.direction) <= -1) {
        throw Error("Direction is not properly set. It might be 'horizontal' or 'vertical'.");
      }
      if (o.direction === 'vertical' && content.clientHeight - container.clientHeight - container.scrollTop <= o.scrollOffset || o.direction === "horizontal" && content.clientWidth() - container.clientWidth() - content.scrollLeft <= o.scrollOffset) {
        return o.callback();
      }
    };
    return container.addEventListener('df:scroll', handler);
  };

  module.exports = dfScroll;

}).call(this);
