
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
  var Displayer, FacetsDisplayer,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Displayer = require("./displayer");

  FacetsDisplayer = (function(superClass) {
    extend(FacetsDisplayer, superClass);

    function FacetsDisplayer() {
      return FacetsDisplayer.__super__.constructor.apply(this, arguments);
    }


    /*
    render
    
    Replaces the older results in container with
    the given
    
    @param {Object} res
    @api public
     */

    FacetsDisplayer.prototype.render = function(res) {
      var html;
      html = this.template(res);
      return document.querySelector(this.container).innerHTML = html;
    };


    /*
    renderMore
    
    Appends results to the older in container
    @param {Object} res
    @api public
     */

    FacetsDisplayer.prototype.renderNext = function(res) {
      return null;
    };

    return FacetsDisplayer;

  })(Displayer);

  module.exports = FacetsDisplayer;

}).call(this);
