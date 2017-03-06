(function() {
  var $, bean, extend, throttle;

  $ = require('./dfdom');

  bean = require('bean');

  extend = require('extend');

  throttle = require('lodash.throttle');

  module.exports = function(container, options) {
    var containerElement, content, defaults, fn;
    if (options == null) {
      options = null;
    }
    container = $(container);
    containerElement = container.element[0];
    defaults = {
      callback: function() {},
      scrollOffset: 200,
      content: containerElement === window ? $("body") : container.children().first(),
      throttle: 250
    };
    options = extend(true, defaults, options || {});
    content = $(options.content);
    container.on('df:scroll', function() {
      var containerHeight, containerScroll, contentHeight, delta;
      contentHeight = content.height();
      containerHeight = container.height();
      containerScroll = container.scrollTop();
      delta = Math.max(0, contentHeight - containerHeight - containerScroll);
      if (containerScroll > 0 && delta >= 0 && delta <= options.scrollOffset) {
        return options.callback();
      }
    });
    fn = function(e) {
      return bean.fire(container.element[0], 'df:scroll');
    };
    return bean.on(containerElement, 'scroll', throttle(fn, options.throttle, {
      leading: true
    }));
  };

}).call(this);
