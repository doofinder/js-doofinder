(function() {
  var QueryInput, Widget, extend,
    extend1 = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  extend = require("extend");

  Widget = require("./widget");


  /**
   * Represents a search input. This widget gets the search terms and calls the
   * controller's search method. Certain minimum number of characters are needed
   * to trigger search but the value is configurable.
   */

  QueryInput = (function(superClass) {
    extend1(QueryInput, superClass);


    /**
     * @param  {String|Node|DfDomElement} element  The search input element.
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
        wait: 43
      };
      QueryInput.__super__.constructor.call(this, element, extend(true, defaults, options));
      this.controller = [];
      this.timer = null;
      this.stopTimer = null;
      this.currentValue = this.element.val() || "";
    }

    QueryInput.prototype.setController = function(controller) {
      return this.controller.push(controller);
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
        this.element.on("input", ((function(_this) {
          return function() {
            return _this.scheduleUpdate();
          };
        })(this)));
        if ((this.element.get(0)).tagName.toUpperCase() !== "TEXTAREA") {
          this.element.on("keydown", (function(_this) {
            return function(e) {
              if ((e.keyCode != null) && e.keyCode === 13) {
                _this.scheduleUpdate(0, true);
                return _this.trigger("df:input:submit", [_this.element.val() || ""]);
              }
            };
          })(this));
        }
        return QueryInput.__super__.init.apply(this, arguments);
      }
    };

    QueryInput.prototype.scheduleUpdate = function(delay, force) {
      var query;
      clearTimeout(this.timer);
      clearTimeout(this.stopTimer);
      query = this.element.val() || "";
      if (delay == null) {
        delay = this.options.wait;
      }
      if (force == null) {
        force = false;
      }
      return this.timer = setTimeout(this.updateStatus.bind(this), delay, query, force);
    };

    QueryInput.prototype.updateStatus = function(query, force) {
      var changed, valid;
      valid = query.length >= this.options.captureLength;
      changed = query.toUpperCase() !== this.currentValue;
      if ((valid && (changed || force)) || (this.currentValue && !query.length)) {
        this.stopTimer = setTimeout(this.trigger.bind(this), this.options.typingTimeout, "df:input:stop", [query]);
        this.currentValue = query.toUpperCase();
        return this.controller.forEach(function(controller) {
          return controller.search(query);
        });
      }
    };


    /**
     * If the widget is configured to be cleaned, empties the value of the input
     * element.
     * @fires QueryInput#df:widget:clean
     */

    QueryInput.prototype.clean = function() {
      if (this.options.clean) {
        this.element.val("");
        return this.trigger("df:widget:clean");
      }
    };

    return QueryInput;

  })(Widget);

  module.exports = QueryInput;

}).call(this);
