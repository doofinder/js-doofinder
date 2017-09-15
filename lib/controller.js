(function() {
  var Client, Controller, Freezer, Thing, bean, extend, qs,
    hasProp = {}.hasOwnProperty;

  bean = require("bean");

  extend = require("extend");

  qs = require("qs");

  Client = require("./client");

  Freezer = require("./util/freezer");

  Thing = require("./util/thing");


  /*
  Controller
  
  This class uses the client to
  to retrieve the data and the widgets
  to paint them.
   */

  Controller = (function() {
    function Controller(client, widgets, defaultParams) {
      var defaults, i, len, widget;
      this.client = client;
      if (widgets == null) {
        widgets = [];
      }
      if (defaultParams == null) {
        defaultParams = {};
      }
      if (!(this.client instanceof Client)) {
        throw this.error("client must be an instance of Client");
      }
      if (!Thing.isArray(widgets)) {
        throw this.error("widgets must be an instance of Array");
      }
      if (!Thing.isPlainObj(defaultParams)) {
        throw this.error("defaultParams must be an instance of Object");
      }
      defaults = {
        query_name: null,
        page: 1,
        rpp: 10
      };
      this.defaults = extend(true, defaults, this.__fixParams(defaultParams));
      this.queryCounter = 0;
      this.widgets = [];
      for (i = 0, len = widgets.length; i < len; i++) {
        widget = widgets[i];
        this.registerWidget(widget);
      }
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

    Controller.prototype.error = function(message) {
      return new Error(this.constructor.name + ": " + message);
    };

    Controller.prototype.deprecate = function(message) {
      if (typeof console !== "undefined" && console !== null) {
        return console.warn("[DEPRECATED][" + this.constructor.name + "]: " + message);
      }
    };


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
        this.deprecate("`filters` key is deprecated for search parameters, use `filter` instead");
      }
      return params;
    };


    /**
     * Resets status and optionally forces query and params. As it is a reset
     * aimed to perform a new search, page is forced to 1 in any case.
     *
     * - done      - true if at least one request has been sent.
     * - lastPage  - indicates the number of the last page for the current status.
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


    /**
     * Proxy method to get options.
     * @return {http.ClientRequest}
     * @public
     */

    Controller.prototype.options = function(suffix, callback) {
      return this.client.options(suffix, callback);
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
      this.trigger("df:search", [this.query, this.params]);
      return this.getResults();
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
        this.trigger("df:getPage", [this.query, this.params]);
        return this.getResults();
      } else {
        return false;
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
      return this.getPage(this.params.page + 1);
    };


    /**
     * Gets the first page for the the current search again.
     *
     * @return {http.ClientRequest|Boolean} The request or false if can't be made.
     * @public
     */

    Controller.prototype.refresh = function() {
      this.params.page = 1;
      this.trigger("df:refresh", [this.query, this.params]);
      return this.getResults();
    };


    /**
     * Get results for the current search status.
     *
     * @return {http.ClientRequest}
     * @public
     */

    Controller.prototype.getResults = function() {
      var params, request;
      this.requestDone = true;
      params = extend(true, {
        query_counter: ++this.queryCounter
      }, this.params);
      return request = this.client.search(this.query, params, (function(_this) {
        return function(err, res) {
          var i, len, ref, widget;
          if (err) {
            return _this.trigger("df:errorReceived", [err]);
          } else if (res.query_counter === _this.queryCounter) {
            _this.lastPage = Math.ceil(res.total / res.results_per_page);
            _this.params.query_name = res.query_name;
            ref = _this.widgets;
            for (i = 0, len = ref.length; i < len; i++) {
              widget = ref[i];
              if (res.page === 1) {
                widget.render(res);
              } else {
                widget.renderNext(res);
              }
            }
            _this.trigger("df:resultsReceived", [res]);
            if (_this.isLastPage) {
              return _this.trigger("df:lastPageReached", [res]);
            }
          }
        };
      })(this));
    };

    Controller.prototype.on = function(eventName, handler, args) {
      return bean.on(this, eventName, handler, args);
    };

    Controller.prototype.one = function(eventName, handler, args) {
      return bean.one(this, eventName, handler, args);
    };

    Controller.prototype.off = function(eventName, handler) {
      return bean.off(this, eventName, handler);
    };

    Controller.prototype.trigger = function(eventName, args) {
      return bean.fire(this, eventName, args);
    };

    Controller.prototype.bind = function(eventName, handler) {
      this.deprecate("`bind()` is deprecated, use `on()` instead");
      return this.on(eventName, handler);
    };

    Controller.prototype.registerWidget = function(widget) {
      this.widgets.push(widget);
      return widget.init(this);
    };

    Controller.prototype.unregisterWidget = function(widget) {
      this.widgets = this.widgets.filter(function(instance) {
        return instance !== widget;
      });
      return widget.controller = void 0;
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
      this.deprecate("`addParam()` is deprecated, use `setParam()` instead");
      return this.setParam(key, value);
    };


    /**
     * Gets the value of a filter or undefined if not defined.
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
      this.params[paramName][key] = Thing.isStr(value) ? [value] : value;
      return this.params[paramName][key];
    };


    /**
     * Removes a value of a filter. If the filter is an array of strings, removes
     * the value inside the array. In any other case removes the entire value.
     *
     * @param  {String} key       Name of the filter.
     * @param  {*}      value     Value of the filter.
     * @param  {String} paramName Name of the parameter ("filter" by default).
     * @return {*}
     * @public
     */

    Controller.prototype.removeFilter = function(key, value, paramName) {
      var pos, ref;
      if (paramName == null) {
        paramName = "filter";
      }
      if (((ref = this.params[paramName]) != null ? ref[key] : void 0) != null) {
        if ((value != null) && Thing.isStrArray(this.params[paramName][key])) {
          pos = this.params[paramName][key].indexOf(value);
          if (pos >= 0) {
            this.params[paramName][key].splice(pos, 1);
          }
          if (this.params[paramName][key].length === 0) {
            delete this.params[paramName][key];
          }
        } else {
          delete this.params[paramName][key];
        }
        return this.params[paramName][key];
      }
    };


    /**
     * Adds a value to a filter. If the value is a String, it's added
     * @param {[type]} key       [description]
     * @param {[type]} value     [description]
     * @param {[type]} paramName =             "filter" [description]
     */

    Controller.prototype.addFilter = function(key, value, paramName) {
      var base, base1;
      if (paramName == null) {
        paramName = "filter";
      }
      if ((base = this.params)[paramName] == null) {
        base[paramName] = {};
      }
      if ((base1 = this.params[paramName])[key] == null) {
        base1[key] = [];
      }
      if (Thing.isStrArray(this.params[paramName][key])) {
        if (Thing.isStr(value)) {
          value = [value];
        }
        if (Thing.isStrArray(value)) {
          value = this.params[paramName][key].concat(value);
        }
      }
      return this.setFilter(key, value, paramName);
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
      var i, key, len, ref, status, value;
      status = extend(true, {
        query: this.query
      }, this.params);
      ref = ['transformer', 'rpp', 'query_counter', 'page'];
      for (i = 0, len = ref.length; i < len; i++) {
        key = ref[i];
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
      var params, query;
      params = (qs.parse(status)) || {};
      if ((Object.keys(params)).length > 0) {
        query = params.query || "";
        delete params.query;
        this.reset(query, params);
        this.requestDone = true;
        return this.refresh();
      } else {
        return false;
      }
    };

    return Controller;

  })();

  module.exports = Controller;

}).call(this);
