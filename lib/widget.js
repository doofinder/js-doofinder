
/*
widget.coffee
author: @ecoslado
2015 11 10
 */


/*
Widget
This class receives the search
results and paint them in a container
shaped by template
 */

(function() {
  var Emitter, Widget, addHelpers, emitter;

  Emitter = require('tiny-emitter');

  emitter = new Emitter;

  addHelpers = require("./util/helpers").addHelpers;

  Widget = (function() {

    /*
    constructor
    
    @param {String} container
    @param {String|Function} template
    @param {Object} extraOptions 
    @api public
     */
    function Widget(container, template, extraOptions) {
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
    start
    
    This is the function where bind the
    events to DOM elements. In Widget
    is dummy. To be overriden.
     */

    Widget.prototype.start = function() {};


    /*
    render
    
    This function will be called when search and
    getPage function si called in controller.
    In Widget is dummy. To be overriden.
    
    @param {Object} res
    @api public
     */

    Widget.prototype.render = function(res) {};


    /*
    renderMore
    
    This function will be called when nextPage
    function si called in controller.
    In Widget is dummy. To be overriden.
    @param {Object} res
    @api public
     */

    Widget.prototype.renderNext = function(res) {};


    /*
    bind
    
    Method to add and event listener
    @param {String} event
    @param {Function} callback
    @api public
     */

    Widget.prototype.bind = function(event, callback) {
      return emitter.on(event, callback);
    };


    /*
    trigger
    
    Method to trigger an event
    @param {String} event
    @param {Array} params
    @api public
     */

    Widget.prototype.trigger = function(event, params) {
      return emitter.emit(event, params);
    };

    return Widget;

  })();

  module.exports = Widget;

}).call(this);
