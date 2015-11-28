
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
    @api public
     */

    function QueryInput(queryInput) {
      this.queryInput = queryInput;
    }


    /*
    start
    
    This is the function where bind the
    events to DOM elements.
    @api public
     */

    QueryInput.prototype.start = function() {
      var _this;
      _this = this;
      return $(this.queryInput).typeWatch({
        callback: function() {
          var query;
          query = document.querySelector(_this.queryInput).value;
          return _this.controller.search(query);
        },
        wait: 43,
        captureLength: 3
      });
    };

    return QueryInput;

  })(Widget);

  module.exports = QueryInput;

}).call(this);
