(function() {
  var $, Widget, bean;

  bean = require("bean");

  $ = require("../util/dfdom");


  /**
   * Base class for a Widget, a class that paints itself given a search response.
   */

  Widget = (function() {

    /**
     * @param  {(String|Node|DfDomElement)} element
     * @param  {Object}                     [options = {}]
     */
    function Widget(element, options) {
      this.options = options != null ? options : {};
      this.initialized = false;
      this.controller = null;
      this.setElement(element);
    }


    /**
     * Assigns the container element to the widget.
     *
     * 99.9% of times this method is used "as is" but can be customized to assign
     * a different container element to the widget.
     *
     * @param  {String|Node|DfDomElement} element   Container node.
     */

    Widget.prototype.setElement = function(element) {
      return this.element = ($(element)).first();
    };


    /**
     * Assigns a controller to the widget, so the widget can get access to the
     * status of the search or directly manipulate the search through the
     * controller, if needed.
     *
     * This method is called by the `Controller` when a widget is registered.
     * Usually a widget is only registered in one controller but you can extend
     * this method to change this behavior.
     *
     * @param {Controller} controller
     */

    Widget.prototype.setController = function(controller) {
      this.controller = controller;
    };


    /**
     * Initializes the widget. Intended to be extended in child classes, this
     * method should be executed only once. This is enforced by the `initialized`
     * attribute.
     *
     * You will want to add your own event handlers here.
     */

    Widget.prototype.init = function() {
      if (!this.initialized) {
        this.initialized = true;
        return this.trigger("df:widget:init");
      }
    };


    /**
     * Renders the widget with the search response received from the server.
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

    Widget.prototype.on = function(eventName, handler) {
      return bean.on(this, eventName, handler);
    };

    Widget.prototype.one = function(eventName, handler) {
      return bean.one(this, eventName, handler);
    };

    Widget.prototype.off = function(eventName, handler) {
      return bean.off(this, eventName, handler);
    };

    Widget.prototype.trigger = function(eventName, args) {
      return bean.fire(this, eventName, args);
    };

    Widget.prototype.toString = function() {
      return this.constructor.name;
    };

    return Widget;

  })();

  module.exports = Widget;

}).call(this);
