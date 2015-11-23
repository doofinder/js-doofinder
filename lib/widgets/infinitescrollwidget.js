
/*
infinitescrollwidget.coffee
author: @ecoslado
2015 11 10
 */


/*
InfiniteScrollWidget
This class receives the search
results and paint them in a container
shaped by template. Ask for a new page
when scroll in wrapper reaches the
bottom
 */

(function() {
  var InfiniteScrollWidget, Widget, dfScroll,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Widget = require("../widget");

  dfScroll = require("../util/dfscroll");

  InfiniteScrollWidget = (function(superClass) {
    extend(InfiniteScrollWidget, superClass);


    /*
    constructor
    
    just assign wrapper property for scrolling and 
    calls super constructor.
    
    @param {String} wrapper
    @param {String} container
    @param {String|Function} template
    @param {Object} extraOptions 
    @api public
     */

    function InfiniteScrollWidget(wrapper, container, template, options) {
      this.wrapper = wrapper;
      InfiniteScrollWidget.__super__.constructor.call(this, container, template, options);
    }

    InfiniteScrollWidget.prototype.start = function() {
      var _this;
      _this = this;
      dfScroll(this.wrapper, {
        callback: function() {
          return _this.controller.nextPage();
        }
      });
      return this.bind('df:search', function() {
        return document.querySelector(_this.wrapper).scrollTop = 0;
      });
    };


    /*
    render
    
    Replaces the older results in container with
    the given
    
    @param {Object} res
    @api public
     */

    InfiniteScrollWidget.prototype.render = function(res) {
      var html;
      html = this.template(res);
      document.querySelector(this.container).innerHTML = html;
      return this.trigger("df:results_rendered", res);
    };


    /*
    renderNext
    
    Appends results to the older in container
    @param {Object} res
    @api public
     */

    InfiniteScrollWidget.prototype.renderNext = function(res) {
      var html;
      html = this.template(res);
      document.querySelector(this.container).insertAdjacentHTML('beforeend', html);
      return this.trigger("df:results_rendered", res);
    };

    return InfiniteScrollWidget;

  })(Widget);

  module.exports = InfiniteScrollWidget;

}).call(this);
