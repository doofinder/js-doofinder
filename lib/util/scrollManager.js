(function() {
  var $, EventEnabled, ScrollManager, merge, throttle,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  throttle = require("lodash.throttle");

  $ = require("../util/dfdom");

  EventEnabled = require("../util/eventEnabled");

  merge = require("../util/merge");

  ScrollManager = (function(superClass) {
    extend(ScrollManager, superClass);

    function ScrollManager(container, options) {
      var defaults, fn;
      if (options == null) {
        options = {};
      }
      defaults = {
        horizontal: false,
        offset: 300,
        throttle: 16
      };
      this.container = $(container);
      this.options = merge(defaults, options);
      this.previousDelta = 0;
      fn = this.options.horizontal ? this.__scrollX : this.__scrollY;
      this.container.on("scroll", throttle(fn.bind(this), this.options.throttle));
    }

    ScrollManager.prototype.__scrollX = function() {
      var direction, offsetReached, rect, scrolled, width;
      rect = this.container.box();
      width = rect.scrollWidth;
      scrolled = rect.scrollLeft + rect.clientWidth;
      direction = rect.scrollLeft >= this.previousDelta ? "right" : "left";
      offsetReached = width - scrolled <= this.options.offset;
      this.previousDelta = rect.scrollLeft;
      return this.trigger("scroll", [rect.scrollLeft, direction, offsetReached]);
    };

    ScrollManager.prototype.__scrollY = function() {
      var direction, height, offsetReached, rect, scrolled;
      rect = this.container.box();
      height = rect.scrollHeight;
      scrolled = rect.scrollTop + rect.clientHeight;
      direction = rect.scrollTop >= this.previousDelta ? "down" : "up";
      offsetReached = height - scrolled <= this.options.offset;
      this.previousDelta = rect.scrollTop;
      return this.trigger("scroll", [rect.scrollTop, direction, offsetReached]);
    };

    return ScrollManager;

  })(EventEnabled);

  module.exports = ScrollManager;

}).call(this);
