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
      scrollOffset: 200,
      content: container.children().first()
    };
    options = extend(true, defaults, options || {});
    content = $(options.content);
    console.log("scrollOffset: " + options.scrollOffset);
    container.on('df:scroll', function() {
      var containerHeight, containerScroll, contentHeight, delta;
      contentHeight = content.height();
      containerHeight = container.height();
      containerScroll = container.scrollTop();
      delta = contentHeight - containerHeight - containerScroll;
      console.log("df:scroll!!! contentHeight(" + contentHeight + ")");
      console.log("df:scroll!!! containerHeight(" + containerHeight + ")");
      console.log("df:scroll!!! containerScrollTop(" + containerScroll + ")");
      console.log("df:scroll!!! delta(" + delta + ")");
      if (delta <= options.scrollOffset) {
        console.log("callback()");
        return options.callback();
      }
    });
    return throttle('scroll', 'df:scroll', container);
  };

}).call(this);
