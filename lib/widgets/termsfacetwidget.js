
/*
termsfacetwidget.coffee
author: @ecoslado
2015 11 10
 */


/*
TermsFacetWidget
This class receives a facet terms and
paint them. Manages the filtering.
 */

(function() {
  var TermsFacetWidget, Widget,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Widget = require("../widget");

  TermsFacetWidget = (function(superClass) {
    extend(TermsFacetWidget, superClass);

    function TermsFacetWidget() {
      return TermsFacetWidget.__super__.constructor.apply(this, arguments);
    }

    TermsFacetWidget.prototype.start = function() {};

    return TermsFacetWidget;

  })(Widget);

  module.exports = TermsFacetWidget;

}).call(this);
