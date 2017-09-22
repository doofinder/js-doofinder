(function() {
  var $, Display, ScrollDisplay, dfScroll, extend,
    extend1 = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Display = require("./display");

  dfScroll = require("../util/dfscroll");

  extend = require('extend');

  $ = require('../util/dfdom');


  /**
   * Displays results by appending subsequent pages for the same search instead of
   * replacing them, and requests next pages when the user reaches the end of the
   * last page rendered.
   */

  ScrollDisplay = (function(superClass) {
    extend1(ScrollDisplay, superClass);


    /**
     * Options:
     *
     * - scrollOffset: 200
     * - contentNode: Node that holds the results will become the container
     *   element of the widget.
     * - contentWrapper: Node that is used for scrolling instead of the first
     *   child of the container.
     *
     *  elementWrapper
     *  -------------------
     * |  contentWrapper  ^|
     * |  --------------- !|
     * | |  element      |!|
     * | |  ------------ |!|
     * | | |  items     ||!|
     *
     * TODO(@carlosescri): Document this better!!!
     *
     * @param  {[type]} element  [description]
     * @param  {[type]} template [description]
     * @param  {[type]} options  [description]
     * @return {[type]}          [description]
     */

    function ScrollDisplay(element, options) {
      var scrollCallback, scrollOptions;
      ScrollDisplay.__super__.constructor.apply(this, arguments);
      if (this.element.element[0] === window && (options.contentNode == null)) {
        throw "when the wrapper is window you must set contentNode option.";
      }
      scrollCallback = (function(_this) {
        return function() {
          if ((_this.controller != null) && !_this.pageRequested) {
            _this.pageRequested = true;
            setTimeout((function() {
              return _this.pageRequested = false;
            }), 5000);
            return _this.controller.getNextPage();
          }
        };
      })(this);
      scrollOptions = {
        callback: scrollCallback
      };
      if (this.options.scrollOffset != null) {
        scrollOptions.scrollOffset = this.options.scrollOffset;
      }
      if (this.options.contentWrapper != null) {
        scrollOptions.content = this.options.contentWrapper;
      }
      this.elementWrapper = this.element;
      if (this.options.contentNode != null) {
        this.element = $(this.options.contentNode);
      } else if (this.element.get(0) === window) {
        this.element = $("body");
      } else {
        if (!this.element.children().length) {
          this.element.append('div');
        }
        this.element = this.element.children().first();
      }
      dfScroll(this.elementWrapper, scrollOptions);
    }


    /**
     * Initializes the object with a controller and attachs event handlers for
     * this widget instance.
     *
     * @param  {Controller} controller Doofinder Search controller.
     */

    ScrollDisplay.prototype.init = function() {
      if (!this.initialized) {
        this.controller.on("df:search df:refresh", (function(_this) {
          return function(query, params) {
            return _this.elementWrapper.scrollTop(0);
          };
        })(this));
        return ScrollDisplay.__super__.init.apply(this, arguments);
      }
    };

    ScrollDisplay.prototype.render = function(res) {
      if (res.page === 1) {
        return ScrollDisplay.__super__.render.apply(this, arguments);
      } else {
        this.pageRequested = false;
        this.element.append(this.renderTemplate(res));
        return this.trigger("df:widget:render", [res]);
      }
    };

    return ScrollDisplay;

  })(Display);

  module.exports = ScrollDisplay;

}).call(this);
