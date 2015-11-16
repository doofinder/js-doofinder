
/*
resultsDisplayer.coffee
author: @ecoslado
2015 11 10
 */


/*
ResultsDisplayer
This class receives the search
results and paint them in a container
shaped by template
 */

(function() {
  var Displayer, addHelpers, jqDf;

  jqDf = require("jquery");

  addHelpers = require("./helpers").addHelpers;

  Displayer = (function() {

    /*
    constructor
    
    @param {String} container
    @param {String|Function} template
    @param {Object} extraOptions 
    @api public
     */
    function Displayer(container, template, extraOptions) {
      if (extraOptions == null) {
        extraOptions = {};
      }
      this.container = jqDf(container);
      this.handlebars = require("handlebars");
      addHelpers(this.handlebars, extraOptions.urlParams, extraOptions.currency, extraOptions.translations, extraOptions.helpers);
      if (template.constructor === String) {
        this.template = this.handlebars.compile(template);
      } else if (template instanceof Function) {
        this.template = template;
      } else {
        throw Error("The provided template is not the right type. String or rendered handlebars expected.");
      }
      this.showMode = extraOptions.showMode;
      if (this.showMode == null) {
        this.showMode = "append";
      }
    }


    /*
    append
    
    Appends results to the older in container
    @param {Object} res
    @api public
     */

    Displayer.prototype.append = function(res) {
      var html, showMode;
      html = this.template(res);
      showMode = showMode || this.showMode;
      return jqDf(this.container).append(html);
    };


    /*
    replace
    
    Replaces the older results in container with
    the given
    
    @param {Object} res
    @api public
     */

    Displayer.prototype.replace = function(res) {
      var html, showMode;
      html = this.template(res);
      showMode = showMode || this.showMode;
      return jqDf(this.container).html(html);
    };


    /*
    bind
    
    Method to add and event listener
    @param {String} event
    @param {Function} callback
    @api public
     */

    Displayer.prototype.bind = function(event, callback) {
      return this.container.on(event, callback);
    };


    /*
    trigger
    
    Method to trigger an event
    @param {String} event
    @param {Array} params
    @api public
     */

    Displayer.prototype.trigger = function(event, params) {
      return this.container.trigger(event, params);
    };

    return Displayer;

  })();

  module.exports = Displayer;

}).call(this);
