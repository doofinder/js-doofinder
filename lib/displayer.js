
/*
displayer.coffee
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
  var Displayer, Emitter, addHelpers, document, emitter;

  Emitter = require('tiny-emitter');

  emitter = new Emitter;

  addHelpers = require("./helpers").addHelpers;

  document = global.document;

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
      this.container = container;
      this.handlebars = require("handlebars");
      addHelpers(this.handlebars, extraOptions.urlParams, extraOptions.currency, extraOptions.translations, extraOptions.helpers);
      if (template.constructor === String) {
        this.template = this.handlebars.compile(template);
      } else if (template instanceof Function) {
        this.template = template;
      } else {
        throw Error("The provided template is not the right type. String or rendered handlebars expected.");
      }
    }


    /*
    render
    
    Replaces the older results in container with
    the given
    
    @param {Object} res
    @api public
     */

    Displayer.prototype.render = function(res) {
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

    Displayer.prototype.renderNext = function(res) {
      var html;
      html = this.template(res);
      return document.querySelector(this.container).innerHTML = html;
    };


    /*
    bind
    
    Method to add and event listener
    @param {String} event
    @param {Function} callback
    @api public
     */

    Displayer.prototype.bind = function(event, callback) {
      return emitter.on(event, callback);
    };


    /*
    trigger
    
    Method to trigger an event
    @param {String} event
    @param {Array} params
    @api public
     */

    Displayer.prototype.trigger = function(event, params) {
      return emitter.emit(event, params);
    };

    return Displayer;

  })();

  module.exports = Displayer;

}).call(this);
