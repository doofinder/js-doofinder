
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
    
    options =
      scrollOffset: 200
      contentNode: "Node that holds the results => this.element"
      contentWrapper: "Node that is used for the scroll instead of the first "
                      "child of the container"
    
    elementWrapper
     -------------------
    |  contentWrapper  ^|
    |  --------------- !|
    | | element       |!|
    | |  ------------ |!|
    | | |   items    ||!|
    
    @api public
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
        if (!this.element.children().length()) {
          this.element.append(document.createElement('div'));
        }
        this.element = this.element.children().first();
      }
      dfScroll(this.elementWrapper, scrollOptions);
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
      this.pageRequested = false;
      this.element.append(this.mustache.render(this.template, this.addHelpers(res)));
      return this.trigger("df:rendered", [res]);
    };

    return ScrollDisplay;

  })(Display);

  module.exports = ScrollDisplay;

}).call(this);
