
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
    
    @param {String} element
    @param {String|Function} template
    @param {Object} extraOptions
    @api public
     */

    function ScrollResults(element, options) {
      var template;
      if (options == null) {
        options = {};
      }
      if (!options.template) {
        template = "<ul>\n  {{#results}}\n    <li>\n      <b>{{title}}</b>: {{description}}\n    </li>\n  {{/results}}\n</ul>";
      } else {
        template = options.template;
      }
      ScrollResults.__super__.constructor.call(this, element, template, options);
    }


    /*
    init
    
    @api public
     */

    ScrollResults.prototype.init = function(controller) {
      var self;
      ScrollResults.__super__.init.call(this, controller);
      self = this;
      return this.element.on('click', 'a[data-df-hitcounter]', function() {
        return self.trigger('df:hit', [this.data('df-hitcounter'), this.attr('href')]);
      });
    };

    return ScrollResults;

  })(ScrollDisplay);

  module.exports = ScrollResults;

}).call(this);
