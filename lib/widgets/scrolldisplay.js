
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
  var $, Display, ScrollDisplay,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Display = require("./display");

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

    function ScrollDisplay(scrollWrapper, template, options) {
      var container, scrollWrapperElement;
      this.scrollWrapper = scrollWrapper;
      scrollWrapperElement = $(this.scrollWrapper);
      this.scrollOptions = options.scrollOptions;
      if (scrollWrapperElement.children().length && !scrollWrapperElement.children().first().attr("id")) {
        scrollWrapperElement.children().first().attr("id", "df-scroll__container");
      } else if (!scrollWrapperElement.children().length) {
        $(this.scrollWrapper).prepend('<div id="df-scroll__container"></div>');
      }
      container = "#" + (scrollWrapperElement.children().first().attr('id'));
      if (options.container) {
        container = options.container;
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
      this.controller = controller;
      _this = this;
      options = $.extend(true, {
        callback: function() {
          return _this.controller.nextPage.call(_this.controller);
        }
      }, this.scrollOptions || {});
      $(this.scrollWrapper).dfScroll(options);
      return this.bind('df:search', function() {
        return $(_this.scrollWrapper).animate({
          scrollTop: 0
        }, "quick");
      });
    };


    /*
    renderNext
    
    Appends results to the older in container
    @param {Object} res
    @api public
     */

    ScrollDisplay.prototype.renderNext = function(res) {
      var html;
      console.log("RENDERNEXT SCROLL DISPLAY");
      html = this.template(res);
      return $(this.container).append(html);
    };

    return ScrollDisplay;

  })(Display);

  module.exports = ScrollDisplay;

}).call(this);
