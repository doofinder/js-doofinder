(function() {
  var $, QueryInput, Thing, Widget, errors, extend,
    extend1 = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  extend = require("extend");

  Widget = require("./widget");

  Thing = require("../util/thing");

  errors = require("../util/errors");

  $ = require("../util/dfdom");


  /**
   * Represents a search input. This widget gets the search terms and calls the
   * controller's search method. Certain minimum number of characters are needed
   * to trigger search but the value is configurable.
   */

  QueryInput = (function(superClass) {
    extend1(QueryInput, superClass);


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
      defaults = {
        clean: true,
        captureLength: 3,
        typingTimeout: 1000,
        wait: 42
      };
      QueryInput.__super__.constructor.call(this, element, extend(true, defaults, options));
      this.controller = [];
      this.currentElement = this.element.first();
      this.timer = null;
      this.stopTimerMap = {};
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
        this.registerInputStopEvent(this.options.typingTimeout);
        return QueryInput.__super__.init.apply(this, arguments);
      }
    };


    /**
     * Register a new input stop event. This event will be dispatched when
     * the user stops to typing during X milliseconds, where X is defined by
     * delay param. The format of the name of the dispatched event is
     * 'df:input:stop:delay'.
     *
     * @param  {Number} delay Delay in milliseconds.
     */

    QueryInput.prototype.registerInputStopEvent = function(delay) {
      return this.stopTimerMap[delay] = null;
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
      var ref, timer;
      if (delay == null) {
        delay = this.options.wait;
      }
      if (force == null) {
        force = false;
      }
      clearTimeout(this.timer);
      ref = this.stopTimerMap;
      for (delay in ref) {
        timer = ref[delay];
        clearTimeout(timer);
      }
      return this.timer = setTimeout(this.__updateStatus.bind(this), delay, force);
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
      var delay, fn, ref, timer, valueChanged, valueOk;
      if (force == null) {
        force = false;
      }
      valueOk = this.value.length >= this.options.captureLength;
      valueChanged = this.value.toUpperCase() !== this.previousValue;
      if (valueOk && (valueChanged || force)) {
        fn = (function(_this) {
          return function(delay) {
            var eventName;
            eventName = "df:input:stop";
            if (+delay !== +_this.options.typingTimeout) {
              eventName = eventName + ":" + delay;
            }
            return _this.stopTimerMap[delay] = setTimeout((function() {
              return _this.trigger(eventName, [_this.value]);
            }), delay);
          };
        })(this);
        ref = this.stopTimerMap;
        for (delay in ref) {
          timer = ref[delay];
          fn(delay);
        }
        this.previousValue = this.value.toUpperCase();
        return this.controller.forEach((function(_this) {
          return function(controller) {
            return controller.search(_this.value);
          };
        })(this));
      } else if (this.previousValue.length > 0 && this.value.length === 0) {
        if (this.value.length === 0) {
          return this.trigger("df:input:none");
        }
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
