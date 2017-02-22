(function() {
  var $, extend, throttle;

  extend = require('extend');

  throttle = require('./throttle');

  $ = require('./dfdom');

  module.exports = function(container, options) {
    var defaults;
    if (options == null) {
      options = null;
    }
    if (typeof container === 'string') {
      container = $(container);
    }
    defaults = {
      scrollOffset: 200,
      content: container.children().first(),
      contentWrapper: void 0
    };
    options = extend(true, defaults, options || {});
    container.on('df:scroll', function() {
      console.log("df:scroll!!! contentHeight(" + (content.height()) + ") containerHeight(" + (container.height()) + ") containerScrollTop(" + (container.scrollTop()) + ")");
      if (content.height() - container.height() - container.scrollTop() <= options.scrollOffset) {
        return options.callback();
      }
    });
    return throttle('scroll', 'df:scroll', container);
  };

}).call(this);
