(function() {
  var QueryInput, Widget, dfTypeWatch, extend,
    extend1 = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  extend = require("extend");

  Widget = require("../widget");

  dfTypeWatch = require("../util/dftypewatch");


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
      if (options == null) {
        options = {};
      }
      QueryInput.__super__.constructor.call(this, element, options);
      this.typingTimeout = this.options.typingTimeout || 1000;
      this.eventsBound = false;
      this.cleanInput = this.options.clean != null ? this.options.clean : true;
    }


    /**
     * Initializes the object with a controller and attachs event handlers for
     * this widget instance. A QueryInput widget can be used by more than one
     * controller (is an input widget, so it doesn't render results).
     *
     * @param  {Controller} controller Doofinder Search controller.
     */

    QueryInput.prototype.init = function(controller) {
      var ctrl, options, self;
      if (this.controller) {
        this.controller.push(controller);
      } else {
        this.controller = [controller];
      }
      self = this;
      if (!this.eventsBound) {
        options = extend(true, {
          callback: function() {
            var query;
            query = self.element.val();
            return self.controller.forEach(function(controller) {
              controller.reset();
              return controller.search.call(controller, query);
            });
          },
          wait: 43,
          captureLength: 3
        }, this.options);
        dfTypeWatch(this.element, options);
        ctrl = this.controller[0];
        ctrl.bind('df:results_received', function(res) {
          return setTimeout((function() {
            if (ctrl.status.params.query_counter === res.query_counter && ctrl.status.currentPage === 1) {
              return self.trigger('df:typing_stopped', [ctrl.status.params.query]);
            }
          }), self.typingTimeout);
        });
        return this.eventsBound = true;
      }
    };


    /**
     * If the widget is configured to be cleaned, empties the value of the input
     * element.
     * @fires QueryInput#df:cleaned
     */

    QueryInput.prototype.clean = function() {
      if (this.cleanInput) {
        this.element.val("");
        return this.trigger("df:cleaned");
      }
    };

    return QueryInput;

  })(Widget);

  module.exports = QueryInput;

}).call(this);
