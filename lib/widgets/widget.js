(function() {
  var $, Widget, bean,
    slice = [].slice;

  bean = require("bean");

  $ = require("../util/dfdom");


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
      this.controller = null;
      this.initialized = false;
    }


    /**
     * Assigns the container element to the widget.
     * @param  {String|Node|DfDomElement} element   Container node.
     */

    Widget.prototype.setElement = function(element) {
      return this.element = ($(element)).first();
    };

    Widget.prototype.setController = function(controller) {
      this.controller = controller;
    };


    /**
     * Initializes the object. Intended to be extended in child classes.
     * You will want to add your own event handlers here.
     *
     * @param  {Controller} controller Doofinder Search controller.
     */

    Widget.prototype.init = function() {
      this.initialized = true;
      return this.trigger("df:widget:init");
    };


    /**
     * Called when the "first page" response for a specific search is received.
     * Renders the widget with the data received.
     *
     * @param  {Object} res Search response.
     */

    Widget.prototype.render = function(res) {
      return this.trigger("df:widget:render", [res]);
    };


    /**
     * Cleans the widget. Intended to be overriden.
     */

    Widget.prototype.clean = function() {
      return this.trigger("df:widget:clean");
    };

    Widget.prototype.on = function(eventName, handler, args) {
      if (args == null) {
        args = [];
      }
      return bean.on.apply(bean, [this, eventName, handler].concat(slice.call(args)));
    };

    Widget.prototype.one = function(eventName, handler, args) {
      if (args == null) {
        args = [];
      }
      return bean.one.apply(bean, [this, eventName, handler].concat(slice.call(args)));
    };

    Widget.prototype.off = function(eventName, handler) {
      return bean.off(this, eventName, handler);
    };

    Widget.prototype.trigger = function(eventName, args) {
      if (args == null) {
        args = [];
      }
      return bean.fire(this, eventName, args);
    };

    return Widget;

  })();

  module.exports = Widget;

}).call(this);
