
/*
scrolldisplay.coffee
author: @ecoslado
2015 11 10
 */


/*
ScrollDisplay
This class receives the search
results and paint them in a container
shaped by template. Ask for a new page
when scroll in wrapper reaches the
bottom
 */

(function() {
  var $, Display, ScrollDisplay, dfScroll,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Display = require("./display");

  dfScroll = require("../util/dfscroll");

  $ = require("../util/jquery");

  ScrollDisplay = (function(superClass) {
    extend(ScrollDisplay, superClass);


    /*
    constructor
    
    just assign wrapper property for scrolling and 
    calls super constructor.
    
    @param {String} scrollWrapper
    @param {String|Function} template
    @param {Object} extraOptions 
    @api public
     */

    function ScrollDisplay(selector, template, options) {
      var container;
      if (options.windowScroll) {
        this.scrollWrapper = $(window);
        this.windowScroll = true;
        container = $(selector);
      } else {
        this.scrollWrapper = $(selector);
        this.scrollOffset = options.scrollOffset;
        if (!this.scrollWrapper.children().length) {
          this.scrollWrapper.prepend('<div></div>');
        }
        container = this.scrollWrapper.children().first();
        if (options.container) {
          container = options.container;
        }
      }
      ScrollDisplay.__super__.constructor.call(this, container, template, options);
    }


    /*
    start
    
    This is the function where bind the
    events to DOM elements.
     */

    ScrollDisplay.prototype.init = function(controller) {
      var _this, options;
      _this = this;
      ScrollDisplay.__super__.init.call(this, controller);
      options = $.extend(true, {
        callback: function() {
          return _this.controller.nextPage.call(_this.controller);
        }
      }, this.scrollOffset ? {
        scrollOffset: this.scrollOffset
      } : {});
      if (this.windowScroll) {
        dfScroll(options);
      } else {
        dfScroll(this.scrollWrapper, options);
      }
      return this.controller.bind('df:search df:refresh', function(params) {
        return _this.scrollWrapper.scrollTop(0);
      });
    };


    /*
    renderNext
    
    Appends results to the older in container
    @param {Object} res
    @api public
     */

    ScrollDisplay.prototype.renderNext = function(res) {
      var context, html;
      context = $.extend(true, res, this.extraContext || {});
      context.is_first = false;
      this.addHelpers(context);
      html = this.mustache.render(this.template, context);
      return $(this.container).append(html);
    };


    /*
    clean
    
    Cleans the container content.
    @api public
     */

    ScrollDisplay.prototype.clean = function() {
      return $(this.container).html("");
    };

    return ScrollDisplay;

  })(Display);

  module.exports = ScrollDisplay;

}).call(this);
