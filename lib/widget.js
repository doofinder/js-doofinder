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


    /**
     * Attachs a single-use event listener to the container element.
     * @param  {String}   event    Event name.
     * @param  {Function} callback Function that will be executed in response to
     *                             the event.
     */

    Widget.prototype.one = function(event, callback) {
      return this.element.one(event, callback);
    };


    /**
     * Attachs an event listener to the container element.
     * TODO(@carlosescri): Rename to "on" to unify.
     *
     * @param  {String}   event    Event name.
     * @param  {Function} callback Function that will be executed in response to
     *                             the event.
     */

    Widget.prototype.bind = function(event, callback) {
      return this.element.on(event, callback);
    };


    /**
     * Removes an event listener from the container element.
     * @param  {String}   event    Event name.
     * @param  {Function} callback Function that won't be executed anymore in
     *                             response to the event.
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


    /**
     * Triggers an event with the container element as the target of the event.
     * @param  {String} event  Event name.
     * @param  {Array}  params Array of parameters to be sent to the handler.
     */

    Widget.prototype.trigger = function(event, params) {
      return this.element.trigger(event, params);
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
