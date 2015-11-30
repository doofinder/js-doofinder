
/*
scrollresults.coffee
author: @ecoslado
2015 11 10
 */


/*
Display
This class receives the search
results and paint them in a container
shaped by template. Every new page
replaces the current content.
 */

(function() {
  var ScrollDisplay, ScrollResults,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  ScrollDisplay = require('../scrolldisplay');

  ScrollResults = (function(superClass) {
    extend(ScrollResults, superClass);


    /*
    constructor
    
    @param {String} container
    @param {String|Function} template
    @param {Object} extraOptions 
    @api public
     */

    function ScrollResults(container, options) {
      var template;
      if (options == null) {
        options = {};
      }
      if (!options.template) {
        template = '<ul>{{#each results}}' + '<li>{{#each this}}' + '<b>{{@key}}</b>:{{this}}<br>' + '{{/each}}</li>' + '{{/each}}' + '</ul>';
      } else {
        template = options.template;
      }
      ScrollResults.__super__.constructor.call(this, container, template, options);
    }

    ScrollResults.prototype.render = function(res) {
      ScrollResults.__super__.render.call(this, res);
      return this.trigger("df:results_rendered", res);
    };

    ScrollResults.prototype.renderNext = function(res) {
      ScrollResults.__super__.renderNext.call(this, res);
      return this.trigger("df:results_rendered", res);
    };

    return ScrollResults;

  })(ScrollDisplay);

  module.exports = ScrollResults;

}).call(this);
