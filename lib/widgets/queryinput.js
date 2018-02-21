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
      this.stopTimer = null;
      Object.defineProperty(this, "value", {
        get: (function(_this) {
          return function() {
            return _this.currentElement.val() || "";
          };
        })(this),
        set: (function(_this) {
          return function(value) {
            _this.currentElement.val(value);
            return _this.__scheduleUpdate(0, true);
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
      return this.element = (($(element)).filter('input[type="text"], input[type="search"], textarea')).filter((function(_this) {
        return function(node) {
          if (node.dfQueryInput != null) {
            throw errors.error("(" + node.id + ") was registered in another QueryInput", node);
          } else {
            return node.dfQueryInput = _this;
          }
        };
      })(this));
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
        this.element.on("input", (function(_this) {
          return function(event) {
            _this.currentElement = $(event.target);
            return _this.__scheduleUpdate();
          };
        })(this));
        this.element.filter(":not(textarea)").on("keydown", (function(_this) {
          return function(event) {
            if ((event.keyCode != null) && event.keyCode === 13) {
              _this.__scheduleUpdate(0, true);
              return _this.trigger("df:input:submit", [_this.value]);
            }
          };
        })(this));
        return QueryInput.__super__.init.apply(this, arguments);
      }
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
      clearTimeout(this.stopTimer);
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
      var valueChanged, valueOk;
      if (force == null) {
        force = false;
      }
      valueOk = this.value.length >= this.options.captureLength;
      valueChanged = this.value.toUpperCase() !== this.previousValue;
      if (valueOk && (valueChanged || force)) {
        this.stopTimer = setTimeout(((function(_this) {
          return function() {
            return _this.trigger("df:input:stop", [_this.value]);
          };
        })(this)), this.options.typingTimeout);
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
