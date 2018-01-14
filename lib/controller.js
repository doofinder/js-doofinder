(function() {
  var Client, Controller, Freezer, Thing, Widget, bean, errors, extend, qs,
    hasProp = {}.hasOwnProperty;

  bean = require("bean");

  extend = require("extend");

  qs = require("qs");

  errors = require("./util/errors");

  Client = require("./client");

  Widget = require("./widgets/widget");

  Freezer = require("./util/freezer");

  Thing = require("./util/thing");


  /*
  Controller
  
  This class uses the client to
  to retrieve the data and the widgets
  to paint them.
   */

  Controller = (function() {
    function Controller(client, defaultParams) {
      var defaults;
      this.client = client;
      if (defaultParams == null) {
        defaultParams = {};
      }
      if (!(this.client instanceof Client)) {
        throw errors.error("client must be an instance of Client", this);
      }
      if (!Thing.is.hash(defaultParams)) {
        throw errors.error("defaultParams must be an instance of Object", this);
      }
      defaults = {
        page: 1,
        rpp: 10
      };
      this.defaults = extend(true, defaults, this.__fixParams(defaultParams));
      this.queryCounter = 0;
      this.widgets = [];
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
     * Fixes any deprecations in the search parameters.
     *
     * - Client now expects "filter" instead of "filters" because the parameters
     *   are sent "as is" in the querystring, no re-processing is made.
     *
     * @param  {Object} params
     * @return {Object}
     * @protected
     */

    Controller.prototype.__fixParams = function(params) {
      if (params.filters != null) {
        params.filter = params.filters;
        delete params.filters;
        errors.warning("`filters` key is deprecated for search parameters, use `filter` instead", this);
      }
      return params;
    };


    /**
     * Resets status and optionally forces query and params. As it is a reset
     * aimed to perform a new search, page is forced to 1 in any case.
     *
     * @param  {String} query  Search terms.
     * @param  {Object} params Optional search parameters.
     * @return {Object}        Updated status.
     */

    Controller.prototype.reset = function(query, params) {
      if (query == null) {
        query = null;
      }
      if (params == null) {
        params = {};
      }
      this.query = query;
      this.params = extend(true, {}, this.defaults, this.__fixParams(params), {
        page: 1
      });
      this.requestDone = false;
      return this.lastPage = null;
    };

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
      this.__getResults();
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
        this.__getResults();
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
      this.__getResults();
      return this.trigger("df:refresh", [this.query, this.params]);
    };


    /**
     * Get results for the current search status.
     *
     * @return {http.ClientRequest}
     * @protected
     */

    Controller.prototype.__getResults = function() {
      var params, request;
      this.requestDone = true;
      params = extend(true, {
        query_counter: ++this.queryCounter
      }, this.params);
      return request = this.client.search(this.query, params, (function(_this) {
        return function(err, res) {
          if (err) {
            _this.trigger("df:results:error", [err]);
            return _this.trigger("df:error_received", [err]);
          } else {
            _this.lastPage = Math.ceil(res.total / res.results_per_page);
            _this.params.query_name = res.query_name;
            _this.renderWidgets(res);
            _this.trigger("df:results:success", [res]);
            _this.trigger("df:results_received", [res]);
            if (_this.isLastPage) {
              return _this.trigger("df:results:end", [res]);
            }
          }
        };
      })(this));
    };

    Controller.prototype.on = function(eventName, handler) {
      return bean.on(this, eventName, handler);
    };

    Controller.prototype.one = function(eventName, handler) {
      return bean.one(this, eventName, handler);
    };

    Controller.prototype.off = function(eventName, handler) {
      return bean.off(this, eventName, handler);
    };

    Controller.prototype.trigger = function(eventName, args) {
      return bean.fire(this, eventName, args);
    };

    Controller.prototype.bind = function(eventName, handler) {
      errors.warning("`bind()` is deprecated, use `on()` instead", this);
      return this.on(eventName, handler);
    };

    Controller.prototype.registerWidget = function(widget) {
      if (!(widget instanceof Widget)) {
        throw errors.error("widget must be an instance of Widget", this);
      }
      widget.setController(this);
      widget.init();
      return this.widgets.push(widget);
    };

    Controller.prototype.registerWidgets = function(widgets) {
      var j, len, results, widget;
      results = [];
      for (j = 0, len = widgets.length; j < len; j++) {
        widget = widgets[j];
        results.push(this.registerWidget(widget));
      }
      return results;
    };

    Controller.prototype.renderWidgets = function(res) {
      this.widgets.forEach(function(widget) {
        return widget.render(res);
      });
      return this.trigger("df:controller:renderWidgets");
    };

    Controller.prototype.cleanWidgets = function() {
      this.widgets.forEach(function(widget) {
        return widget.clean();
      });
      return this.trigger("df:controller:cleanWidgets");
    };

    Controller.prototype.getParam = function(key) {
      return this.params[key];
    };

    Controller.prototype.setParam = function(key, value) {
      return this.params[key] = value;
    };

    Controller.prototype.removeParam = function(key, value) {
      return delete this.params[key];
    };

    Controller.prototype.addParam = function(key, value) {
      errors.warning("`addParam()` is deprecated, use `setParam()` instead", this);
      return this.setParam(key, value);
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
      } else if ((Thing.is.hash(this.params[paramName][key])) && (Thing.is.hash(value))) {
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
        } else if (Thing.is.hash(this.params[paramName][key])) {
          if (!Thing.is.hash(value)) {
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
      value = extend(true, {}, currentFilter);
      if ((newFilter.gt != null) || (newFilter.gte != null)) {
        delete value.gt;
        delete value.gte;
      }
      if ((newFilter.lt != null) || (newFilter.lte != null)) {
        delete value.lt;
        delete value.lte;
      }
      return extend(true, value, newFilter);
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

    Controller.prototype.serializeStatus = function() {
      var j, key, len, ref, status, value;
      status = extend(true, {
        query: this.query
      }, this.params);
      ref = ['transformer', 'rpp', 'query_counter', 'page'];
      for (j = 0, len = ref.length; j < len; j++) {
        key = ref[j];
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

    Controller.prototype.loadStatus = function(status) {
      var params, query, requestParams;
      params = (qs.parse(status)) || {};
      if ((Object.keys(params)).length > 0) {
        requestParams = extend(true, {}, params);
        query = requestParams.query || "";
        delete requestParams.query;
        this.reset(query, requestParams);
        this.requestDone = true;
        this.refresh();
        return params;
      } else {
        return false;
      }
    };

    return Controller;

  })();

  module.exports = Controller;

}).call(this);
