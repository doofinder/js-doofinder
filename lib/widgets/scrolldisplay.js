
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
  var $, Display, ScrollDisplay, dfScroll, extend,
    extend1 = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Display = require("./display");

  dfScroll = require("../util/dfscroll");

  extend = require('extend');

  $ = require('../util/dfdom');

  ScrollDisplay = (function(superClass) {
    extend1(ScrollDisplay, superClass);


    /*
    constructor
    
    just assign wrapper property for scrolling and
    calls super constructor.
    
    @param {String} element
    @param {String|Function} template
    @param {Object} extraOptions
    @api public
     */

    function ScrollDisplay(element, template, options) {
      var scrollOptions, self;
      self = this;
      ScrollDisplay.__super__.constructor.call(this, element, template, options);
      scrollOptions = extend(true, {
        callback: function() {
          if (self.controller != null) {
            return self.controller.nextPage.call(self.controller);
          }
        }
      }, options.scrollOffset != null ? {
        scrollOffset: options.scrollOffset
      } : {});
      if (options.windowScroll) {
        this.elementWrapper = $(document.body);
        dfScroll(scrollOptions);
      } else {
        if (!this.element.children().length) {
          this.element.append(document.createElement('div'));
        }
        this.elementWrapper = this.element;
        this.element = this.element.children().first();
        if (options.container) {
          if (typeof options.container === 'string') {
            this.element = $(options.container);
          } else {
            this.element = options.container;
          }
        }
        dfScroll(this.elementWrapper, scrollOptions);
      }
    }


    /*
    start
    
    This is the function where bind the
    events to DOM elements.
     */

    ScrollDisplay.prototype.init = function(controller) {
      var self;
      ScrollDisplay.__super__.init.call(this, controller);
      self = this;
      return this.controller.bind('df:search df:refresh', function(params) {
        return self.elementWrapper.scrollTop(0);
      });
    };


    /*
    renderNext
    
    Appends results to the older in container
    @param {Object} res
    @api public
     */

    ScrollDisplay.prototype.renderNext = function(res) {
      var context;
      context = extend(true, res, this.extraContext || {});
      context.is_first = false;
      this.addHelpers(context);
      this.element.append(this.mustache.render(this.template, context));
      return this.trigger("df:rendered", [res]);
    };

    return ScrollDisplay;

  })(Display);

  module.exports = ScrollDisplay;

}).call(this);
