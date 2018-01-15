(function() {
  var $, Display, ScrollDisplay, Thing, extend, throttle,
    extend1 = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  extend = require("extend");

  throttle = require("lodash.throttle");

  $ = require("../util/dfdom");

  Thing = require("../util/thing");

  Display = require("./display");


  /**
   * Displays results by appending subsequent pages for the same search instead of
   * replacing them, and requests next pages when the user reaches the end of the
   * last page rendered.
   */

  ScrollDisplay = (function(superClass) {
    extend1(ScrollDisplay, superClass);


    /**
     * @param  {DfDomElement|Element|String} element Will be used as scroller.
     * @param  {Object} options
     *
     * Options:
     *
     * - contentElement:  By default content will be rendered inside the scroller
     *                    unless this option is set to a valid container. This is
     *                    optional unless the scroller is the window object, in
     *                    that case this is mandatory.
     * - offset:          Distance to the bottom. If the scroll reaches this point a new
     *                    results page will be requested.
     * - throttle:        Time in milliseconds to wait between scroll checks. This
     *                    value limits calculations associated to the scroll event.
     * - horizontal:      False by default. Scroll is handled vertically by default.
     *                    If this options is enabled scroll is handled horizontally.
     *
     * Markup:
     *
     * You can just use a container element. Content will be rendered inside.
     *
     *  ______________________
     * |                      |
     * |  `element`           |
     * |  __________________  |
     * | |                  | |
     * | | RENDERED CONTENT | |
     * | |__________________| |
     * |______________________|
     *
     * If you need to put extra content inside the container, before or after
     * the rendered results, use the `contentElement` option:
     *
     *  __________________________
     * |                          |
     * |  `element`               |
     * |  ______________________  |
     * | |                      | |
     * | | HEADER               | |
     * | |______________________| |
     * |  ______________________  |
     * | |                      | |
     * | | `contentElement`     | |
     * | |  __________________  | |
     * | | |                  | | |
     * | | | RENDERED CONTENT | | |
     * | | |__________________| | |
     * | |______________________| |
     * |  ______________________  |
     * | |                      | |
     * | | FOOTER               | |
     * | |______________________| |
     * |__________________________|
     *
     * IMPORTANT: Don't rely on the `element` attribute to do stuff with the
     * container, if you use the `contentElement` option, that node will become
     * the `element` node. To access the container always use the `container`
     * attribute.
     *
     * TODO: Check how this works when the container is the window object.
     */

    function ScrollDisplay(element, options) {
      var defaultOptions;
      defaultOptions = {
        contentElement: null,
        offset: 300,
        throttle: 16,
        horizontal: false
      };
      options = extend(true, defaultOptions, options || {});
      ScrollDisplay.__super__.constructor.call(this, element, options);
      this.container = this.element;
      this.__setContentElement();
      this.working = false;
      this.previousDelta = 0;
    }


    /**
     * Gets the element that will hold search results.
     */

    ScrollDisplay.prototype.__setContentElement = function() {
      if (this.options.contentElement != null) {
        return this.setElement(this.element.find(this.options.contentElement));
      } else if (Thing.is.window(this.element.get(0))) {
        throw "ScrollDisplay: contentElement must be specified when the container is the window object";
      }
    };

    ScrollDisplay.prototype.init = function() {
      var fn;
      if (!this.initialized) {
        fn = this.options.horizontal ? this.__scrollX : this.__scrollY;
        this.container.on("scroll", throttle(fn.bind(this), this.options.throttle));
        this.controller.on("df:search df:refresh", (function(_this) {
          return function(query, params) {
            return _this.container.scrollTop(0);
          };
        })(this));
        return ScrollDisplay.__super__.init.apply(this, arguments);
      }
    };

    ScrollDisplay.prototype.__scrollX = function() {
      var direction, rect, scrolled, width;
      rect = this.container.box();
      width = rect.scrollWidth;
      scrolled = rect.scrollLeft + rect.clientWidth;
      if (width - scrolled <= this.options.offset) {
        this.__getNextPage();
      }
      direction = rect.scrollLeft >= this.previousDelta ? "right" : "left";
      this.previousDelta = rect.scrollLeft;
      this.trigger("df:widget:scroll", [rect.scrollLeft, direction]);
      return this.container.trigger("df:scroll");
    };

    ScrollDisplay.prototype.__scrollY = function() {
      var direction, height, rect, scrolled;
      rect = this.container.box();
      height = rect.scrollHeight;
      scrolled = rect.scrollTop + rect.clientHeight;
      if (height - scrolled <= this.options.offset) {
        this.__getNextPage();
      }
      direction = rect.scrollTop >= this.previousDelta ? "down" : "up";
      this.previousDelta = rect.scrollTop;
      this.trigger("df:widget:scroll", [rect.scrollTop, direction]);
      return this.container.trigger("df:scroll");
    };

    ScrollDisplay.prototype.__getNextPage = function() {
      if ((this.controller != null) && !this.working) {
        this.working = true;
        setTimeout(((function(_this) {
          return function() {
            return _this.working = false;
          };
        })(this)), 2000);
        return this.controller.getNextPage();
      }
    };

    ScrollDisplay.prototype.render = function(res) {
      if (res.page === 1) {
        return ScrollDisplay.__super__.render.apply(this, arguments);
      } else {
        this.working = false;
        this.element.append(this.__renderTemplate(res));
        this.trigger("df:widget:render", [res]);
        return this.trigger("df:rendered", [res]);
      }
    };

    return ScrollDisplay;

  })(Display);

  module.exports = ScrollDisplay;

}).call(this);
