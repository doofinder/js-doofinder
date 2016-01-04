
/*
windowscrolldisplay.coffee
author: @ecoslado
2015 11 10
 */


/*
WindowScrollDisplay
This class receives the search
results and paint them in a container
shaped by template. Ask for a new page
when scroll in wrapper reaches the
bottom
 */

(function() {
  var $, Display, WindowScrollDisplay, dfScroll,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Display = require("./display");

  dfScroll = require("../util/dfscroll");

  $ = require("../util/jquery");

  WindowScrollDisplay = (function(superClass) {
    extend(WindowScrollDisplay, superClass);


    /*
    constructor
    
    just assign wrapper property for scrolling and 
    calls super constructor.
    
    @param {String} scrollWrapper
    @param {String|Function} template
    @param {Object} extraOptions 
    @api public
     */

    function WindowScrollDisplay(container, template, options) {
      this.scrollOffset = options.scrollOffset;
      WindowScrollDisplay.__super__.constructor.call(this, container, template, options);
    }


    /*
    start
    
    This is the function where bind the
    events to DOM elements.
     */

    WindowScrollDisplay.prototype.init = function(controller) {
      var _this, options;
      WindowScrollDisplay.__super__.init.call(this, controller);
      _this = this;
      options = $.extend(true, {
        callback: function() {
          return _this.controller.nextPage.call(_this.controller);
        }
      }, this.scrollOffset ? {
        scrollOffset: this.scrollOffset
      } : {});
      dfScroll(options);
      return this.controller.bind('df:search df:refresh', function(params) {
        return $(window).scrollTop(0);
      });
    };


    /*
    renderNext
    
    Appends results to the older in container
    @param {Object} res
    @api public
     */

    WindowScrollDisplay.prototype.renderNext = function(res) {
      var html;
      html = this.template(res);
      return $(this.container).append(html);
    };


    /*
    clean
    
    Cleans the container content.
    @api public
     */

    WindowScrollDisplay.prototype.clean = function() {
      return $(this.container).html("");
    };

    return WindowScrollDisplay;

  })(Display);

  module.exports = WindowScrollDisplay;

}).call(this);
