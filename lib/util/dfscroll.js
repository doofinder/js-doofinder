(function() {
  var $, bean, dimensions, extend, introspection, throttle;

  extend = require('extend');

  introspection = require('./introspection');

  throttle = require('./throttle');

  dimensions = require('./dimensions');

  $ = require('./dfdom');

  bean = require('bean');

  module.exports = function(arg1, arg2) {
    var container, content, defaults, options;
    if (arg2 == null) {
      arg2 = null;
    }
    defaults = {
      direction: "vertical",
      scrollOffset: 200
    };
    if (introspection.isPlainObject(arg1)) {
      options = extend(true, defaults, arg1);
      content = document;
      container = window;
      console.log(bean.on);
      bean.on(container, 'df:scroll', function() {
        if (['horizontal', 'vertical'].indexOf(options.direction) <= -1) {
          throw Error("[Doofinder] dfScroll: Direction is not properly set. It might be 'horizontal' or 'vertical'.");
        }
        if (options.direction === 'vertical' && window.innerHeight + window.scrollY + options.scrollOffset >= dimensions.clientHeight(content) || options.direction === "horizontal" && window.innerWidth + window.scrollX + options.scrollOffset >= dimensions.clientWidth(content)) {
          return options.callback();
        }
      });
    } else {
      options = extend(true, defaults, arg2);
      if (typeof arg1 === 'string') {
        container = $(arg1);
      } else {
        container = arg1;
      }
      content = container.children().first();
      container.on('df:scroll', function() {
        if (['horizontal', 'vertical'].indexOf(options.direction) <= -1) {
          throw Error("[Doofinder] dfScroll: Direction is not properly set. It might be 'horizontal' or 'vertical'.");
        }
        if (options.direction === 'vertical' && content.height() - container.height() - container.scrollTop() <= options.scrollOffset || options.direction === "horizontal" && content.width() - container.width() - container.scrollLeft() <= options.scrollOffset) {
          return options.callback();
        }
      });
    }
    return throttle('scroll', 'df:scroll', container);
  };

}).call(this);
