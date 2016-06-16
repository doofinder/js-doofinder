(function() {
  var bean, extend, introspection, throttle;

  extend = require('./extend');

  introspection = require('./introspection');

  throttle = require('./throttle');

  bean = require('bean');

  module.exports = function(arg1, arg2) {
    var container, content, defaults, options, wrapper;
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
      wrapper = window;
    } else {
      options = arg2;
      if (typeof arg1 === 'string') {
        container = document.querySelector(arg1);
      } else {
        container = arg1;
      }
      content = container.children[0];
      wrapper = container;
    }
    options = extend(true, defaults, options);
    throttle('scroll', 'df:scroll', wrapper);
    return bean.on(wrapper, 'df:scroll', function() {
      if (['horizontal', 'vertical'].indexOf(options.direction) <= -1) {
        throw Error("[Doofinder] dfScroll: Direction is not properly set. It might be 'horizontal' or 'vertical'.");
      }
      if (options.direction === 'vertical' && content.clientHeight - container.clientHeight - container.scrollTop <= options.scrollOffset || options.direction === "horizontal" && content.clientWidth - container.clientWidth - content.scrollLeft <= options.scrollOffset) {
        return options.callback();
      }
    });
  };

}).call(this);
