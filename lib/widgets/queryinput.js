
/*
queryinput.coffee
author: @ecoslado
2015 11 21
 */

(function() {
  var QueryInput, Widget, dfTypeWatch, extend,
    extend1 = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  extend = require('extend');

  Widget = require('../widget');

  dfTypeWatch = require('../util/dftypewatch');


  /*
  QueryInput
  
  This class gets the query and
  calls controller's search method.
  Gets the string from an input when
  receives more than given number of
  characters (3 by default).
   */

  QueryInput = (function(superClass) {
    extend1(QueryInput, superClass);


    /*
    constructor
    
    Just to set the queryInput
    
    @param {String} queryInput
    @param {Object} options
    @api public
     */

    function QueryInput(element, options1) {
      this.options = options1 != null ? options1 : {};
      QueryInput.__super__.constructor.call(this, element);
    }


    /*
    start
    
    This is the function where bind the
    events to DOM elements.
    @api public
     */

    QueryInput.prototype.init = function(controller) {
      var options, self;
      if (this.controller) {
        this.controller.push(controller);
      } else {
        this.controller = [controller];
      }
      self = this;
      options = extend(true, {
        callback: function() {
          var query;
          query = self.element.val();
          controller.reset();
          return controller.search.call(controller, query);
        },
        wait: 43,
        captureLength: 3
      }, this.options);
      return dfTypeWatch(this.element, options);
    };

    return QueryInput;

  })(Widget);

  module.exports = QueryInput;

}).call(this);
