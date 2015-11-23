
/*
queryinputwidget.coffee
author: @ecoslado
2015 11 21
 */

(function() {
  var QueryInputWidget, Widget, dfTypeWatch,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  dfTypeWatch = require('../util/dftypewatch');

  Widget = require('../widget');


  /*
  QueryInputWidget
  
  This class gets the query and
  calls controller's search method.
  Gets the string from an input when
  receives more than three characters.
   */

  QueryInputWidget = (function(superClass) {
    extend(QueryInputWidget, superClass);

    function QueryInputWidget(queryInput) {
      this.queryInput = queryInput;
    }

    QueryInputWidget.prototype.start = function() {
      var _this;
      _this = this;
      return dfTypeWatch(this.queryInput, {
        callback: function() {
          var query;
          query = document.querySelector(_this.queryInput).value;
          return _this.controller.search(query);
        },
        wait: 43,
        captureLength: 3
      });
    };

    return QueryInputWidget;

  })(Widget);

  module.exports = QueryInputWidget;

}).call(this);
