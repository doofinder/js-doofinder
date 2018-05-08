(function() {
  var $, QueryInput, Thing, Widget, errors, merge,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Widget = require("./widget");

  Thing = require("../util/thing");

  merge = require("../util/merge");

  errors = require("../util/errors");

  $ = require("../util/dfdom");


  /**
   * Represents a search input. This widget gets the search terms and calls the
   * controller's search method. Certain minimum number of characters are needed
   * to trigger search but the value is configurable.
   */

  QueryInput = (function(superClass) {
    extend(QueryInput, superClass);


    /**
     * @param  {String|Array} element  The search input element as css selector or
                                        Array with String|Node|DfDomElement
                                        elements.
     * @param  {Object} options Options object. Empty by default.
     */

    function QueryInput(element, options) {
      var defaults;
      if (options == null) {
        options = {};
      }
      this.unregisterDelayedEvent = bind(this.unregisterDelayedEvent, this);
      this.registerDelayedEvent = bind(this.registerDelayedEvent, this);
      defaults = {
        clean: true,
        captureLength: 3,
        typingTimeout: 1000,
        wait: 42,
        delayedEvents: null
      };
      QueryInput.__super__.constructor.call(this, element, merge(defaults, options));
      this.controller = [];
      this.currentElement = this.element.first();
      this.timer = null;
      this.activeEventTimers = {};
      this.delayedEvents = merge({}, this.options.delayedEvents || {});
      Object.defineProperty(this, "value", {
        get: (function(_this) {
          return function() {
            return _this.currentElement.val() || "";
          };
        })(this),
        set: (function(_this) {
          return function(value) {
            _this.currentElement.val(value);
            return _this.currentElement.trigger("df:input:valueChanged");
          };
        })(this)
      });
      this.previousValue = this.value;
    }

    QueryInput.prototype.setController = function(controller) {
      if (!Thing.is.array(controller)) {
        controller = [controller];
      }
      return this.controller = this.controller.concat(controller);
    };

    QueryInput.prototype.setElement = function(element) {
      return this.element = ($(element)).filter(['input:not([type])', 'input[type="text"]', 'input[type="search"]', 'textarea'].join(","));
    };


    /**
     * Sets the input element considered as the currently active one.
     *
     * If the provided element is the current active element nothing happens.
     * Otherwise a "df:input:targetChanged" event is triggered.
     *
     * TODO: This should validate that the current element belongs to
     * this.element.
     *
     * @param {HTMLElement} element Input node.
     * @protected
     */

    QueryInput.prototype.__setCurrentElement = function(element) {
      var previousElement;
      if (this.currentElement.isnt(element)) {
        previousElement = this.currentElement.get(0);
        this.trigger("df:input:targetChanged", [element, previousElement]);
        return this.currentElement = $(element);
      }
    };


    /**
     * Initializes the object with a controller and attachs event handlers for
     * this widget instance. A QueryInput widget can be used by more than one
     * controller (is an input widget, so it doesn't render results).
     *
     * @param  {Controller} controller Doofinder Search controller.
     */

    QueryInput.prototype.init = function() {
      if (!this.initialized) {
        this.element.on("focus", (function(_this) {
          return function(event) {
            return _this.__setCurrentElement(event.target);
          };
        })(this));
        this.element.on("input", (function(_this) {
          return function(event) {
            _this.__setCurrentElement(event.target);
            return _this.__scheduleUpdate();
          };
        })(this));
        this.element.on("df:input:valueChanged", (function(_this) {
          return function() {
            return _this.__updateStatus(true);
          };
        })(this));
        this.registerDelayedEvent("df:input:stop", this.options.typingTimeout);
        return QueryInput.__super__.init.apply(this, arguments);
      }
    };


    /**
     * Register a new event with the specified name that is dispatched when the
     * user stop typing during the number of miliseconds defined by delay param.
     * If eventName exits, the delay assigned is update.
     *
     * @param {String} eventName  Name of the event
     * @param {Number} delay      Time in miliseconds that the event waits after
     *                            the user stops typing to be dispatched.
     */

    QueryInput.prototype.registerDelayedEvent = function(eventName, delay) {
      return this.delayedEvents[eventName] = delay;
    };


    /**
     * Unregister the delayed event with the given name.
     *
     * @param {String}  eventName Name of the event will be unregistered.
     */

    QueryInput.prototype.unregisterDelayedEvent = function(eventName) {
      this.__cancelDelayedEvent(eventName);
      return delete this.delayedEvents[eventName];
    };


    /**
     * Schedules input validation so its done "in the future", giving the user
     * time to enter a new character (delaying search requests).
     *
     * @param  {Number} delay  = @options.wait  Time to wait until update in
     *                         milliseconds.
     * @param  {Boolean} force = false  Forces search if value is OK whether
     *                         value changed or not.
     * @protected
     */

    QueryInput.prototype.__scheduleUpdate = function(delay, force) {
      if (delay == null) {
        delay = this.options.wait;
      }
      if (force == null) {
        force = false;
      }
      clearTimeout(this.timer);
      this.__cancelDelayedEvents();
      return this.timer = setTimeout(this.__updateStatus.bind(this), delay, force);
    };


    /**
     * Schedules all declared events to be dispatched after the configured time.
     */

    QueryInput.prototype.__scheduleDelayedEvents = function() {
      var delay, eventName, ref, results;
      ref = this.delayedEvents;
      results = [];
      for (eventName in ref) {
        delay = ref[eventName];
        results.push(this.__scheduleDelayedEvent(eventName, delay));
      }
      return results;
    };


    /**
     * Schedules an event that will be dispatched after the given delay in ms.
     *
     * @param {String}  eventName
     * @param {Number}  delay
     */

    QueryInput.prototype.__scheduleDelayedEvent = function(eventName, delay) {
      return this.activeEventTimers[eventName] = setTimeout(((function(_this) {
        return function() {
          return _this.trigger(eventName, [_this.value]);
        };
      })(this)), delay);
    };


    /**
     * Cancels all scheduled events.
     */

    QueryInput.prototype.__cancelDelayedEvents = function() {
      var eventName, i, len, ref, results;
      ref = Object.keys(this.delayedEvents);
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        eventName = ref[i];
        results.push(this.__cancelDelayedEvent(eventName));
      }
      return results;
    };


    /**
     * Schedules an event that will be dispatched after the given delay in ms.
     *
     * @param {String}  eventName
     * @param {Number}  delay
     */

    QueryInput.prototype.__cancelDelayedEvent = function(eventName) {
      clearTimeout(this.activeEventTimers[eventName]);
      return delete this.activeEventTimers[eventName];
    };


    /**
     * Checks current value of the input and, if it is OK and it changed since the
     * last check, performs a new search in each registered controller.
     *
     * @param  {Boolean} force = false If true forces search if value is OK
     *                         whether value changed or not.
     * @protected
     */

    QueryInput.prototype.__updateStatus = function(force) {
      var valueChanged, valueDeleted, valueOk;
      if (force == null) {
        force = false;
      }
      valueOk = this.value.length >= this.options.captureLength;
      valueChanged = this.value.toUpperCase() !== this.previousValue;
      valueDeleted = this.previousValue.length > 0 && this.value.length === 0;
      this.previousValue = this.value.toUpperCase();
      if (valueOk && (valueChanged || force)) {
        this.__scheduleDelayedEvents();
        return this.controller.forEach((function(_this) {
          return function(controller) {
            return controller.search(_this.value);
          };
        })(this));
      } else if (valueDeleted) {
        return this.trigger("df:input:none");
      }
    };


    /**
     * If the widget is configured to be cleaned, empties the value of the input
     * element.
     * @fires Widget#df:widget:clean
     */

    QueryInput.prototype.clean = function() {
      if (this.options.clean) {
        this.element.val("");
      }
      return QueryInput.__super__.clean.apply(this, arguments);
    };

    return QueryInput;

  })(Widget);

  module.exports = QueryInput;

}).call(this);
