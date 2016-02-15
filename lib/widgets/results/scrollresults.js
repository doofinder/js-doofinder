
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
  var $, ScrollDisplay, ScrollResults,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  ScrollDisplay = require('../scrolldisplay');

  $ = require('../../util/jquery');

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
        template = '<ul>{{#results}}{{@index}}<li><b>{{title}}</b>:{{description}}<br></li>{{/results}}</ul>';
      } else {
        template = options.template;
      }
      ScrollResults.__super__.constructor.call(this, container, template, options);
    }


    /*
    init
    
    @api public
     */

    ScrollResults.prototype.init = function(controller) {
      var _this;
      ScrollResults.__super__.init.call(this, controller);
      _this = this;
      return $(this.container).on('click', 'a[data-df-hitcounter]', function(e) {
        return _this.trigger('df:hit', [$(this).data('dfHitcounter'), $(this).attr('href')]);
      });
    };


    /*
    render
    
    just inherits render method and triggers
    df:results_rendered
    
    @param {Object} res
    @api public
     */

    ScrollResults.prototype.render = function(res) {
      ScrollResults.__super__.render.call(this, res);
      return this.trigger("df:rendered", res);
    };


    /*
    renderNext
    
    just inherits render method and triggers
    df:results_rendered
    
    @param {Object} res
    @api public
     */

    ScrollResults.prototype.renderNext = function(res) {
      ScrollResults.__super__.renderNext.call(this, res);
      return this.trigger("df:rendered", res);
    };

    return ScrollResults;

  })(ScrollDisplay);

  module.exports = ScrollResults;

}).call(this);
