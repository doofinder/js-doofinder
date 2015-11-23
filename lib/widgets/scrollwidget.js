
/*
scrollwidget.coffee
author: @ecoslado
2015 11 10
 */


/*
ScrollWidget
This class receives the search
results and paint them in a container
shaped by template.
 */

(function() {
  var ScrollWidget, Widget, dfScroll,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Widget = require("../widget");

  dfScroll = require("../util/dfscroll");

  ScrollWidget = (function(superClass) {
    extend(ScrollWidget, superClass);

    function ScrollWidget() {
      return ScrollWidget.__super__.constructor.apply(this, arguments);
    }


    /*
    render
    
    Replaces the older results in container with
    the given
    
    @param {Object} res
    @api public
     */

    ScrollWidget.prototype.render = function(res) {
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

    ScrollWidget.prototype.renderNext = function(res) {
      var html;
      html = this.template(res);
      document.querySelector(this.container).insertAdjacentHTML('beforeend', html);
      return this.trigger("df:results_rendered", res);
    };

    return ScrollWidget;

  })(Widget);

  module.exports = ScrollWidget;

}).call(this);
