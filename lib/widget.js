(function() {
  var $, Widget, bean;

  bean = require("bean");

  $ = require("./util/dfdom");


  /**
   * Base class for a Widget, a class that paints itself given a search response.
   *
   * A widget knows how to:
   *
   * - Render and clean itself.
   * - Bind handlers to/trigger events on the main element node.
   */

  Widget = (function() {

    /**
     * @param  {String|Node|DfDomElement} element   Container node.
     * @param  {Object} @options = {}               Options for the widget.
     */
    function Widget(element, options) {
      this.options = options != null ? options : {};
      this.setElement(element);
    }


    /**
     * Assigns the container element to the widget.
     * @param  {String|Node|DfDomElement} element   Container node.
     */

    Widget.prototype.setElement = function(element) {
      return this.element = ($(element)).first();
    };


    /**
     * Initializes the object. Intended to be extended in child classes.
     * You will want to add your own event handlers here.
     *
     * @param  {Controller} controller Doofinder Search controller.
     */

    Widget.prototype.init = function(controller) {
      this.controller = controller;
    };


    /**
     * Called when the "first page" response for a specific search is received.
     * Renders the widget with the data received.
     *
     * @param  {Object} res Search response.
     */

    Widget.prototype.render = function(res) {};


    /**
     * Called when subsequent (not "first-page") responses for a specific search
     * are received. Renders the widget with the data received.
     *
     * @param  {Object} res Search response.
     */

    Widget.prototype.renderNext = function(res) {};


    /**
     * Cleans the widget. Intended to be overriden.
     */

    Widget.prototype.clean = function() {};

    Widget.prototype.on = function(eventName, handler, args) {
      if (args == null) {
        args = [];
      }
      return this.element.on(eventName, handler, args);
    };

    Widget.prototype.one = function(eventName, handler, args) {
      if (args == null) {
        args = [];
      }
      return this.element.one(eventName, handler, args);
    };

    Widget.prototype.off = function(eventName, handler) {
      return this.element.off(eventName, handler);
    };

    Widget.prototype.trigger = function(eventName, args) {
      if (args == null) {
        args = [];
      }
      return this.element.trigger(eventName, args);
    };


    /**
     * Throws an error that can be captured.
     * @param  {String} message Error message.
     * @throws {Error}
     */

    Widget.prototype.raiseError = function(message) {
      throw Error("[Doofinder] " + message);
    };

    return Widget;

  })();

  module.exports = Widget;

}).call(this);
