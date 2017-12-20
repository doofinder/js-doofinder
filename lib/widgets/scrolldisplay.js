(function() {
  var $, Debouncer, Display, ScrollDisplay, Thing, extend,
    extend1 = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  extend = require("extend");

  $ = require("../util/dfdom");

  Debouncer = require("../util/debouncer");

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
     * - contentElement: By default content will be rendered inside the scroller
     *     unless this option is set to a valid container. This is optional unless
     *     the scroller is the window object, in which case this is mandatory.
     * - offset: Distance to the bottom. If the scroll reaches this point a new
     *     results page will be requested.
     * - vertical: True by default. Otherwise scroll is handled horizontally.
     *
     * Old Schema, for reference:
     *
     *
     *  elementWrapper
     *  --------------------
     * |  contentWrapper   ^|
     * |  ---------------  !|
     * | |  element      | !|
     * | |  ------------ | !|
     * | | |            || !|
     * | | | items here || !|
     * | | |            || !|
     * | |  ------------ | !|
     * |  ---------------  !|
     *  --------------------
     *
     * TODO: Check if this can handle all cases (it's supposed to do so because
     * its not based on content).
     * TODO: Check how this works when the container is the window object.
     */

    function ScrollDisplay(element, options) {
      var defaultOptions, fn;
      defaultOptions = {
        contentElement: null,
        offset: 300,
        vertical: true
      };
      options = extend(true, defaultOptions, options);
      ScrollDisplay.__super__.constructor.apply(this, arguments);
      this.scroller = this.element;
      this.setContentElement();
      fn = this.options.vertical ? this.scrollY : this.scrollX;
      this.debouncer = new Debouncer(fn.bind(this));
      this.working = false;
    }


    /**
     * Gets the element that will hold search results.
     * @return {[type]} [description]
     */

    ScrollDisplay.prototype.setContentElement = function() {
      if (this.options.contentElement != null) {
        return this.setElement(this.element.find(this.options.contentElement));
      } else if (Thing.is.window(this.element.get(0))) {
        throw "ScrollDisplay: contentElement must be specified when the scroller is the window object";
      }
    };

    ScrollDisplay.prototype.init = function() {
      if (!this.initialized) {
        this.scroller.get(0).addEventListener("scroll", this.debouncer);
        this.controller.on("df:search df:refresh", (function(_this) {
          return function(query, params) {
            return _this.scroller.scrollTop(0);
          };
        })(this));
        return ScrollDisplay.__super__.init.apply(this, arguments);
      }
    };

    ScrollDisplay.prototype.scrollX = function() {
      var rect, scrolled, width;
      rect = this.scroller.box();
      width = rect.scrollWidth;
      scrolled = rect.scrollLeft + rect.clientWidth;
      if (width - scrolled <= this.options.offset) {
        return this.getNextPage();
      }
    };

    ScrollDisplay.prototype.scrollY = function() {
      var height, rect, scrolled;
      rect = this.scroller.box();
      height = rect.scrollHeight;
      scrolled = rect.scrollTop + rect.clientHeight;
      if (height - scrolled <= this.options.offset) {
        return this.getNextPage();
      }
    };

    ScrollDisplay.prototype.getNextPage = function() {
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
        this.element.append(this.renderTemplate(res));
        return this.trigger("df:widget:render", [res]);
      }
    };

    return ScrollDisplay;

  })(Display);

  module.exports = ScrollDisplay;

}).call(this);
