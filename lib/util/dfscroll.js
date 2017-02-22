(function() {
  var $, extend, throttle;

  extend = require('extend');

  throttle = require('./throttle');

  $ = require('./dfdom');

  module.exports = function(container, options) {
    var content, defaults;
    if (options == null) {
      options = null;
    }
    if (typeof container === 'string') {
      container = $(container);
    }
    defaults = {
      callback: function() {},
      scrollOffset: 200,
      content: container.children().first()
    };
    options = extend(true, defaults, options || {});
    content = $(options.content);
    container.on('df:scroll', function() {
      var containerHeight, containerScroll, contentHeight, delta;
      contentHeight = content.height();
      containerHeight = container.height();
      containerScroll = container.scrollTop();
      delta = contentHeight - containerHeight - containerScroll;
      if (delta <= options.scrollOffset) {
        return options.callback();
      }
    });
    return throttle('scroll', 'df:scroll', container);
  };

}).call(this);
