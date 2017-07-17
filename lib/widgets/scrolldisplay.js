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

    function ScrollDisplay(element, template, options) {
      var scrollOptions, self;
      ScrollDisplay.__super__.constructor.apply(this, arguments);
      if (this.element.element[0] === window && (options.contentNode == null)) {
        throw "when the wrapper is window you must set contentNode option.";
      }
      self = this;
      scrollOptions = {
        callback: function() {
          if ((self.controller != null) && !self.pageRequested) {
            self.pageRequested = true;
            setTimeout(function() {
              return self.pageRequested = false;
            }, 5000);
            return self.controller.nextPage.call(self.controller);
          }
        }
      };
      if (options.scrollOffset != null) {
        scrollOptions.scrollOffset = options.scrollOffset;
      }
      if (options.contentWrapper != null) {
        scrollOptions.content = options.contentWrapper;
      }
      this.elementWrapper = this.element;
      if (options.contentNode != null) {
        this.element = $(options.contentNode);
      } else if (this.element.element[0] === window) {
        this.element = $("body");
      } else {
        if (!this.element.children().length) {
          this.element.append(document.createElement('div'));
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

    ScrollDisplay.prototype.init = function(controller) {
      ScrollDisplay.__super__.init.apply(this, arguments);
      return this.controller.bind('df:search df:refresh', (function(_this) {
        return function(params) {
          return _this.elementWrapper.scrollTop(0);
        };
      })(this));
    };


    /**
     * Called when subsequent (not "first-page") responses for a specific search
     * are received. Renders the widget with the data received, by appending
     * content after the last content received.
     *
     * @param {Object} res Search response.
     * @fires ScrollDisplay#df:rendered
     */

    ScrollDisplay.prototype.renderNext = function(res) {
      this.pageRequested = false;
      this.element.append(this.mustache.render(this.template, this.buildContext(res)));
      return this.trigger("df:rendered", [res]);
    };

    return ScrollDisplay;

  })(Display);

  module.exports = ScrollDisplay;

}).call(this);
