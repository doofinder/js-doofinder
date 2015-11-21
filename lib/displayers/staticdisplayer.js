
/*
resultsdisplayer.coffee
author: @ecoslado
2015 11 10
 */


/*
Displayer
This class receives the search
results and paint them in a container
shaped by template
 */

(function() {
  var Displayer, StaticDisplayer,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Displayer = require("../displayer");

  StaticDisplayer = (function(superClass) {
    extend(StaticDisplayer, superClass);

    function StaticDisplayer() {
      return StaticDisplayer.__super__.constructor.apply(this, arguments);
    }


    /*
    render
    
    Replaces the older results in container with
    the given
    
    @param {Object} res
    @api public
     */

    StaticDisplayer.prototype.render = function(res) {
      var html;
      html = this.template(res);
      document.querySelector(this.container).innerHTML = html;
      return this.trigger("df:results_rendered", res);
    };


    /*
    renderMore
    
    Appends results to the older in container
    @param {Object} res
    @api public
     */

    StaticDisplayer.prototype.renderNext = function(res) {
      return null;
    };

    return StaticDisplayer;

  })(Displayer);

  module.exports = StaticDisplayer;

}).call(this);
