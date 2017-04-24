
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
  var $, Widget, bean;

  bean = require("bean");

  $ = require("./util/dfdom");

  Widget = (function() {
    function Widget(element, options) {
      this.options = options;
      this.setElement(element);
    }

    Widget.prototype.setElement = function(element) {
      return this.element = ($(element)).first();
    };


    /*
    init
    
    This is the function where bind the
    events to DOM elements. In Widget
    is dummy. To be overriden.
     */

    Widget.prototype.init = function(controller) {
      return this.controller = controller;
    };


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
    clean
    
    This function clean the html in the widget.
    In Widget is dummy. To be overriden.
    
    @api public
     */

    Widget.prototype.clean = function() {};


    /*
    one
    
    Method to add and event listener and the handler will only be executed once
    @param {String} event
    @param {Function} callback
    @api public
     */

    Widget.prototype.one = function(event, callback) {
      return this.element.one(event, callback);
    };


    /*
    bind
    
    Method to add and event listener
    @param {String} event
    @param {Function} callback
    @api public
     */

    Widget.prototype.bind = function(event, callback) {
      return this.element.on(event, callback);
    };


    /*
    off
    
    Method to remove an event listener
    @param {String} event
    @param {Function} callback
    @api public
     */

    Widget.prototype.off = function(event, callback) {
      return this.element.off(event, callback);
    };


    /*
    trigger
    
    Method to trigger an event
    @param {String} event
    @param {Array} params
    @api public
     */

    Widget.prototype.trigger = function(event, params) {
      return this.element.trigger(event, params);
    };


    /*
    raiseError
    
    Method to raise a Doofinder error
    @param {String} message
     */

    Widget.prototype.raiseError = function(message) {
      throw Error("[Doofinder] " + message);
    };

    return Widget;

  })();

  module.exports = Widget;

}).call(this);
