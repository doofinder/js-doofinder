(function() {
  var Client, Controller, EventEnabled, Freezer, Thing, Widget, errors, merge, qs,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  qs = require("qs");

  Client = require("./client");

  errors = require("./util/errors");

  EventEnabled = require("./util/eventEnabled");

  Freezer = require("./util/freezer");

  merge = require("./util/merge");

  Thing = require("./util/thing");

  Widget = require("./widgets/widget");


  /*
  Controller
  
  This class uses the client to
  to retrieve the data and the widgets
  to paint them.
   */

  Controller = (function(superClass) {
    extend(Controller, superClass);

    function Controller(client, defaultParams) {
      var defaults;
      this.client = client;
      if (defaultParams == null) {
        defaultParams = {};
      }
      if (!(this.client instanceof Client)) {
        throw errors.error("client must be an instance of Client", this);
      }
      if (!Thing.is.plainObject(defaultParams)) {
        throw errors.error("defaultParams must be an instance of Object", this);
      }
      defaults = {
        page: 1,
        rpp: 10
      };
      this.defaults = merge(defaults, defaultParams);
      this.queryCounter = 0;
      this.widgets = [];
      this.processors = [];
      this.paramsPreprocessors = [];
      Object.defineProperty(this, 'hashid', {
        get: function() {
          return this.client.hashid;
        }
      });
      Object.defineProperty(this, 'isFirstPage', {
        get: function() {
          return this.requestDone && this.params.page === 1;
        }
      });
      Object.defineProperty(this, 'isLastPage', {
        get: function() {
          return this.requestDone && this.params.page === this.lastPage;
        }
      });
      this.reset();
    }


    /**
     * Resets status and optionally forces query and params. As it is a reset
     * aimed to perform a new search.
     *
     * @param  {String} query  Search terms.
     * @param  {Object} params Optional search parameters.
     * @param  {Object} items to search using getItems method
     * @return {Object}        Updated status.
     */

    Controller.prototype.reset = function(query, params, items) {
      if (query == null) {
        query = null;
      }
      if (params == null) {
        params = {};
      }
      if (items == null) {
        items = [];
      }
      this.query = query;
      this.params = merge({
        page: 1
      }, this.defaults, params);
      this.items = items;
      this.requestDone = false;
      return this.lastPage = null;
    };


    /**
     * Resets status and clean widgets at the same time.
     * @public
     */

    Controller.prototype.clean = function() {
      this.reset();
      return this.cleanWidgets();
    };


    /**
     * Performs a request for a new search (resets status).
     * Page will always be 1 in this case.
     *
     * @param  {String} query  Search terms.
     * @param  {Object} params Search parameters.
     * @return {http.ClientRequest}
     * @public
     */

    Controller.prototype.search = function(query, params) {
      if (params == null) {
        params = {};
      }
      this.reset(query, params);
      this.__doSearch();
      return this.trigger("df:search", [this.query, this.params]);
    };


    /**
     * Performs a get items request.
     * Page will always be 1 in this case.
     *
     * @param  {Object} dfid list to get.
     * @param  {Object} params Search parameters.
     * @return {http.ClientRequest}
     * @public
     */

    Controller.prototype.getItems = function(items, params) {
      if (params == null) {
        params = {};
      }
      this.reset(null, params, items);
      this.__doSearch();
      return this.trigger("df:search", [this.query, this.params]);
    };


    /**
     * Performs a request to get results for a specific page of the current
     * search. Requires a search being made via `search()` to set a status.
     *
     * @param  {Number} page
     * @return {http.ClientRequest|Boolean} The request or false if can't be made.
     * @public
     */

    Controller.prototype.getPage = function(page) {
      page = parseInt(page, 10);
      if (this.requestDone && page <= this.lastPage) {
        this.params.page = page;
        this.__doSearch();
        return this.trigger("df:search:page", [this.query, this.params]);
      }
    };


    /**
     * Performs a request to get results for the next page of the current search,
     * if the last page was not already reached.
     *
     * @return {http.ClientRequest|Boolean} The request or false if can't be made.
     * @public
     */

    Controller.prototype.getNextPage = function() {
      return this.getPage((this.params.page || 1) + 1);
    };


    /**
     * Gets the first page for the the current search again.
     *
     * @return {http.ClientRequest|Boolean} The request or false if can't be made.
     * @public
     */

    Controller.prototype.refresh = function() {
      this.params.page = 1;
      this.__doSearch();
      return this.trigger("df:refresh", [this.query, this.params]);
    };


    /**
     * Get results for the current search status.
     *
     * @return {http.ClientRequest}
     * @protected
     */

    Controller.prototype.__doSearch = function() {
      var __getResults, params, request;
      this.prePreprocessParams(this.params);
      this.requestDone = true;
      params = merge({
        query_counter: ++this.queryCounter
      }, this.params);
      __getResults = (function(_this) {
        return function(err, response) {
          if (err) {
            return _this.trigger("df:results:error", [err]);
          } else if (response.query_counter === _this.queryCounter) {
            _this.lastPage = Math.ceil(response.total / response.results_per_page);
            _this.params.query_name = response.query_name;
            _this.processResponse(response);
            _this.renderWidgets(response);
            _this.trigger("df:results:success", [response]);
            if (_this.isLastPage) {
              return _this.trigger("df:results:end", [response]);
            }
          } else {
            return _this.trigger("df:results:discarded", [response]);
          }
        };
      })(this);
      if (this.items.length > 0) {
        return request = this.client.getItems(this.items, params, __getResults);
      } else {
        return request = this.client.search(this.query, params, __getResults);
      }
    };


    /**
     * Transform the response by passing it through a set of data processors,
     * if any.
     *
     * @param  {Object} response Search response.
     * @return {Object}          The resulting search response.
     */

    Controller.prototype.processResponse = function(response) {
      return this.processors.reduce((function(data, fn) {
        return fn(data);
      }), response);
    };


    /**
     * Transform the params by passing it through a set of data  paramsProcessors,
     * if any.
     *
     * @param  {Object} The params passed to the query.
     */

    Controller.prototype.prePreprocessParams = function(params) {
      return this.paramsPreprocessors.reduce((function(data, fn) {
        return fn(data);
      }), params);
    };


    /**
     * Registers a widget in the current controller instance.
     *
     * @param  {Widget} widget  An instance of Widget (or any of its subclasses).
     * @public
     */

    Controller.prototype.registerWidget = function(widget) {
      if (!(widget instanceof Widget)) {
        throw errors.error("widget must be an instance of Widget", this);
      }
      widget.setController(this);
      widget.init();
      return this.widgets.push(widget);
    };


    /**
     * Registers multiple widgets at the same time in the current controller
     * instance.
     *
     * @param  {Array} widgets  An array of Widget instances.
     * @public
     */

    Controller.prototype.registerWidgets = function(widgets) {
      var j, len, results, widget;
      results = [];
      for (j = 0, len = widgets.length; j < len; j++) {
        widget = widgets[j];
        results.push(this.registerWidget(widget));
      }
      return results;
    };


    /**
     * Makes registered widgets render themselves with the provided search
     * response.
     *
     * Triggers an event when all widgets' `render()` method have been executed.
     *
     * @param {Object} res A search response.
     * @fires Controller#df:controller:renderWidgets
     * @public
     */

    Controller.prototype.renderWidgets = function(res) {
      this.widgets.forEach(function(widget) {
        var err, error;
        try {
          return widget.render(res);
        } catch (error) {
          err = error;
          errors.warning("Couldn't render " + widget + " widget due to an error:\n\n" + err.stack + "\n\nRefresh your browser's cache and try again. If the error persists contact support.");
          return widget.clean();
        }
      });
      return this.trigger("df:controller:renderWidgets");
    };


    /**
     * Makes registered widgets clean themselves.
     *
     * Triggers an event when all widgets' `clean()` method have been executed.
     *
     * @fires Controller#df:controller:cleanWidgets
     * @public
     */

    Controller.prototype.cleanWidgets = function() {
      this.widgets.forEach(function(widget) {
        return widget.clean();
      });
      return this.trigger("df:controller:cleanWidgets");
    };


    /**
     * Returns the value of a search parameter.
     *
     * @param  {String} key
     * @return {*}
     * @public
     */

    Controller.prototype.getParam = function(key) {
      return this.params[key];
    };


    /**
     * Sets the value of a search parameter.
     *
     * @param {string}  key
     * @param {*}       value
     * @public
     */

    Controller.prototype.setParam = function(key, value) {
      return this.params[key] = value;
    };


    /**
     * Removes a search parameter.
     *
     * @param  {String} key
     * @public
     */

    Controller.prototype.removeParam = function(key) {
      return delete this.params[key];
    };


    /**
     * Gets the value of a filter
     *
     * @param  {String} key       Name of the filter.
     * @param  {String} paramName Name of the parameter ("filter" by default).
     * @return {*}
     * @public
     */

    Controller.prototype.getFilter = function(key, paramName) {
      var ref;
      if (paramName == null) {
        paramName = "filter";
      }
      return (ref = this.params[paramName]) != null ? ref[key] : void 0;
    };


    /**
     * Sets the value of a filter.
     *
     * String values are stored inside an array for the given key.
     *
     * @param  {String} key       Name of the filter.
     * @param  {*}      value     Value of the filter.
     * @param  {String} paramName Name of the parameter ("filter" by default).
     * @return {*}
     * @public
     */

    Controller.prototype.setFilter = function(key, value, paramName) {
      var base;
      if (paramName == null) {
        paramName = "filter";
      }
      if ((base = this.params)[paramName] == null) {
        base[paramName] = {};
      }
      this.params[paramName][key] = Thing.is.string(value) ? [value] : value;
      return this.params[paramName][key];
    };


    /**
     * Adds a value to a filter.
     *
     * @param {String}  key       Name of the filter.
     * @param {*}       value     Value to be added.
     * @param {String}  paramName = "filter"
     */

    Controller.prototype.addFilter = function(key, value, paramName) {
      var base;
      if (paramName == null) {
        paramName = "filter";
      }
      if ((base = this.params)[paramName] == null) {
        base[paramName] = {};
      }
      if (Thing.is.array(this.params[paramName][key])) {
        if (Thing.is.array(value)) {
          return this.params[paramName][key] = this.params[paramName][key].concat(value.filter((function(_this) {
            return function(x, i, arr) {
              return (_this.params[paramName][key].indexOf(x)) < 0;
            };
          })(this)));
        } else {
          if (!((this.params[paramName][key].indexOf(value)) >= 0)) {
            return this.params[paramName][key].push(value);
          }
        }
      } else if ((Thing.is.plainObject(this.params[paramName][key])) && (Thing.is.plainObject(value))) {
        return this.params[paramName][key] = this.__buildHashFilter(this.params[paramName][key], value);
      } else {
        return this.setFilter(key, value, paramName);
      }
    };


    /**
     * Removes a value from a filter.
     *
     * - If values are stored in an array:
     *   - If a single value is passed, removes it from the array, if exists.
     *   - If an array is passed, removes as much values as it can from the array.
     *   - Passing an object is a wrong use case, don't do it.
     * - If values are stored in a plain Object:
     *   - If a single value is passed, it is considered a key of the filter, so
     *     direct removal is tried.
     *   - If a plain Object is passed as a value, removes as much keys as it can
     *     from the filter.
     *   - Passing an array is a wrong use case, don't do it.
     * - If no value is passed, the entire filter is removed.
     * - In any other case, if the value matches the value of the filter, the
     *   entire filter is removed.
     *
     * @param  {String} key       Name of the filter.
     * @param  {*}      value     Value of the filter.
     * @param  {String} paramName Name of the parameter ("filter" by default).
     * @return {*}
     * @public
     */

    Controller.prototype.removeFilter = function(key, value, paramName) {
      var j, len, ref, ref1, x;
      if (paramName == null) {
        paramName = "filter";
      }
      if (((ref = this.params[paramName]) != null ? ref[key] : void 0) != null) {
        if (value == null) {
          delete this.params[paramName][key];
        } else if (Thing.is.array(this.params[paramName][key])) {
          if (!Thing.is.array(value)) {
            value = [value];
          }
          this.params[paramName][key] = this.params[paramName][key].filter(function(x, i, arr) {
            return (value.indexOf(x)) < 0;
          });
          if (this.params[paramName][key].length === 0) {
            delete this.params[paramName][key];
          }
        } else if (Thing.is.plainObject(this.params[paramName][key])) {
          if (!Thing.is.plainObject(value)) {
            delete this.params[paramName][key][value];
          } else {
            ref1 = Object.keys(value);
            for (j = 0, len = ref1.length; j < len; j++) {
              x = ref1[j];
              delete this.params[paramName][key][x];
            }
          }
          if (!(Object.keys(this.params[paramName][key])).length) {
            delete this.params[paramName][key];
          }
        } else if (this.params[paramName][key] === value) {
          delete this.params[paramName][key];
        }
        return this.params[paramName][key];
      }
    };


    /**
     * Fixes filters in case they're range filters so there are no conflicts
     * between filter properties (for instance, "gt" and "gte" being used in the
     * same filter).
     *
     * @protected
     * @param  {Object} currentFilter
     * @param  {Object} newFilter
     * @return {Object}
     */

    Controller.prototype.__buildHashFilter = function(currentFilter, newFilter) {
      var value;
      if (currentFilter == null) {
        currentFilter = {};
      }
      if (newFilter == null) {
        newFilter = {};
      }
      value = merge({}, currentFilter);
      if ((newFilter.gt != null) || (newFilter.gte != null)) {
        delete value.gt;
        delete value.gte;
      }
      if ((newFilter.lt != null) || (newFilter.lte != null)) {
        delete value.lt;
        delete value.lte;
      }
      return merge(value, newFilter);
    };

    Controller.prototype.getExclusion = function(key) {
      return this.getFilter(key, "exclude");
    };

    Controller.prototype.setExclusion = function(key, value) {
      return this.setFilter(key, value, "exclude");
    };

    Controller.prototype.removeExclusion = function(key, value) {
      return this.removeFilter(key, value, "exclude");
    };

    Controller.prototype.addExclusion = function(key, value) {
      return this.addFilter(key, value, "exclude");
    };


    /**
     * Returns the current status of the controller as a URL querystring.
     *
     * Useful to save it somewhere and recover later.
     *
     * @return {String}
     * @public
     */

    Controller.prototype.serializeStatus = function(include) {
      var ignored_keys, j, key, len, status, value;
      if (include == null) {
        include = [];
      }
      status = merge({
        query: this.query
      }, this.params);
      ignored_keys = ['transformer', 'rpp', 'query_counter', 'page'].filter(function(x) {
        return include.indexOf(x) < 0;
      });
      for (j = 0, len = ignored_keys.length; j < len; j++) {
        key = ignored_keys[j];
        delete status[key];
      }
      for (key in status) {
        if (!hasProp.call(status, key)) continue;
        value = status[key];
        if (!value) {
          delete status[key];
        }
      }
      if ((Object.keys(status)).length > 0) {
        return qs.stringify(status);
      } else {
        return "";
      }
    };


    /**
     * Changes the status of the controller based on the value of the status
     * parameter.
     *
     * @param  {String} status  Status previously obtained with `serializeStatus`.
     * @return {Object|Boolean} Status parameters as an Object or `false` if
     *                          status could not be recovered.
     */

    Controller.prototype.loadStatus = function(status) {
      var params, query, requestParams;
      params = (qs.parse(status)) || {};
      if ((Object.keys(params)).length > 0) {
        requestParams = merge({}, params);
        query = requestParams.query || "";
        delete requestParams.query;
        this.reset(query, requestParams);
        this.requestDone = true;
        this.__doSearch();
        return params;
      } else {
        return false;
      }
    };

    return Controller;

  })(EventEnabled);

  module.exports = Controller;

}).call(this);
