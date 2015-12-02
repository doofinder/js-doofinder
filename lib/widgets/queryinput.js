
/*
queryinput.coffee
author: @ecoslado
2015 11 21
 */

(function() {
  var $, QueryInput, Widget,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  $ = require('../util/jquery');

  Widget = require('../widget');


  /*
  QueryInput
  
  This class gets the query and
  calls controller's search method.
  Gets the string from an input when
  receives more than three characters.
   */

  QueryInput = (function(superClass) {
    extend(QueryInput, superClass);


    /*
    constructor
    
    Just to set the queryInput
    
    @param {String} queryInput
    @param {Object} options
    @api public
     */

    function QueryInput(queryInput, options1) {
      this.queryInput = queryInput;
      this.options = options1 != null ? options1 : {};
    }


    /*
    start
    
    This is the function where bind the
    events to DOM elements.
    @api public
     */

    QueryInput.prototype.init = function(controller) {
      var _this, options;
      if (this.controller) {
        this.controller.push(controller);
      } else {
        this.controller = [controller];
      }
      _this = this;
      options = $.extend(true, {
        callback: function() {
          var query;
          query = $(_this.queryInput).val();
          return controller.search.call(controller, query);
        },
        wait: 43,
        captureLength: 3
      }, this.options);
      return $(this.queryInput).typeWatch(options);
    };

    return QueryInput;

  })(Widget);

  module.exports = QueryInput;

}).call(this);
