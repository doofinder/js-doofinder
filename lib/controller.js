
/*
 * Created by Kike Coslado on 26/10/15.
 * 20160419 REV(@JoeZ99)
 */

(function() {
  var $, Bean, Controller, extend, qs,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  $ = require("./util/jquery");

  Bean = require("bean");

  extend = require("./util/extend");

  qs = require("qs");


  /*
  Controller
  
  This class uses the client to
  to retrieve the data and the widgets
  to paint them.
   */

  Controller = (function() {

    /*
    Controller constructor
    
    @param {doofinder.Client} client
    @param {doofinder.widget | Array} widgets
    @param {Object} searchParams
    @api public
     */
    function Controller(client, widgets, searchParams1) {
      var i, len, widget;
      this.searchParams = searchParams1 != null ? searchParams1 : {};
      this.client = client;
      this.hashid = client.hashid;
      this.widgets = [];
      if (widgets instanceof Array) {
        for (i = 0, len = widgets.length; i < len; i++) {
          widget = widgets[i];
          this.addWidget(widget);
        }
      } else if (widgets) {
        this.addWidget(widgets);
      }
      this.status = extend(true, {}, {
        params: extend(true, {}, this.searchParams)
      });
      this.reset();
    }


    /*
    __search
    this method invokes Client's search method for
    retrieving the data and use widget's replace or
    append to show them.
    
    @param {String} event: the event name
    @param {Array} params: the params will be passed
      to the listeners
    @api private
     */

    Controller.prototype.__search = function(next) {
      var _this, params;
      if (next == null) {
        next = false;
      }
      this.status.params.query_counter++;
      params = extend(true, {}, this.status.params || {});
      params.page = this.status.currentPage;
      _this = this;
      return this.client.search(params.query, params, function(err, res) {
        var i, len, ref, results, widget;
        if (err) {
          return _this.trigger("df:error_received", [err]);
        } else if (res) {
          if (res.results.length < _this.status.params.rpp) {
            _this.status.lastPageReached = true;
          }
          if (!_this.searchParams.query_name) {
            _this.status.params.query_name = res.query_name;
          }
          _this.trigger("df:results_received", [res]);
          if (res.query_counter === _this.status.params.query_counter) {
            ref = _this.widgets;
            results = [];
            for (i = 0, len = ref.length; i < len; i++) {
              widget = ref[i];
              if (next) {
                results.push(widget.renderNext(res));
              } else {
                results.push(widget.render(res));
              }
            }
            return results;
          }
        }
      });
    };


    /*
    __search wrappers
     */


    /*
    search
    
    Takes a new query, initializes status and performs
    a search
    
    @param {String} query: the query term
    @api public
     */

    Controller.prototype.search = function(query, params) {
      var queryCounter, searchParams;
      if (params == null) {
        params = {};
      }
      if (query) {
        searchParams = extend(true, {}, this.searchParams);
        queryCounter = this.status.params.query_counter;
        this.status.params = extend(true, {}, params);
        this.status.params = extend(true, searchParams, params);
        this.status.params.query = query;
        this.status.params.filters = extend(true, {}, this.searchParams.filters || {}, params.filters);
        this.status.params.query_counter = queryCounter;
        if (!this.searchParams.query_name) {
          delete this.status.params.query_name;
        }
        this.status.currentPage = 1;
        this.status.firstQueryTriggered = true;
        this.status.lastPageReached = false;
        this.__search();
      }
      return this.trigger("df:search", [this.status.params]);
    };


    /*
    nextPage
    
    Increments the currentPage and performs a search. Takes
    the next page results and shows them.
    
    @api public
     */

    Controller.prototype.nextPage = function(replace) {
      if (replace == null) {
        replace = false;
      }
      if (this.status.firstQueryTriggered && this.status.currentPage > 0 && !this.status.lastPageReached) {
        this.trigger("df:next_page");
        this.status.currentPage++;
        return this.__search(true);
      }
    };


    /*
    getPage
    
    Set the currentPage with a given value and performs a search.
    Takes a given page and shows the results.
    
    @param {Number} page: the page you are retrieving
    @api public
     */

    Controller.prototype.getPage = function(page) {
      var self;
      if (this.status.firstQueryTriggered && this.status.currentPage > 0) {
        this.trigger("df:get_page");
        this.status.currentPage = page;
        self = this;
        return this.__search();
      }
    };


    /*
    refresh
    
    Makes a search call with the current status.
    
    @api public
     */

    Controller.prototype.refresh = function() {
      if (this.status.params.query) {
        this.trigger("df:refresh", [this.status.params]);
        this.status.currentPage = 1;
        this.status.firstQueryTriggered = true;
        this.status.lastPageReached = false;
        return this.__search();
      }
    };


    /*
    addFilter
    
    Adds new filter criteria.
    
    @param {String} key: the facet key you are filtering
    @param {String | Object} value: the filtering criteria
    @api public
     */

    Controller.prototype.addFilter = function(key, value) {
      this.status.currentPage = 1;
      if (!this.status.params.filters) {
        this.status.params.filters = {};
      }
      if (value.constructor === Object) {
        this.status.params.filters[key] = value;
        if (this.searchParams.filters && this.searchParams.filters[key]) {
          return delete this.searchParams.filters[key];
        }
      } else if (!this.status.params.filters[key]) {
        return this.status.params.filters[key] = [value];
      } else {
        return this.status.params.filters[key].push(value);
      }
    };


    /*
    addParam
    
    Adds new search parameter to the current status.
    
    @param {String} key: the facet key you are filtering
    @param {String | Number} value: the filtering criteria
    @api public
     */

    Controller.prototype.addParam = function(key, value) {
      return this.status.params[key] = value;
    };


    /*
    clearParam
    
    Removes search parameter from current status.
    
    @param {String} key: the name of the param
    @api public
     */

    Controller.prototype.clearParam = function(key) {
      if (indexOf.call(this.status.params, key) >= 0) {
        return delete this.status.params[key];
      }
    };


    /*
    reset
    
    Reset the params to the initial state.
    
    @api public
     */

    Controller.prototype.reset = function() {
      var queryCounter;
      queryCounter = this.status.params.query_counter || 1;
      this.status = {
        params: extend(true, {}, this.searchParams),
        currentPage: 0,
        firstQueryTriggered: false,
        lastPageReached: false
      };
      this.status.params.query_counter = queryCounter;
      if (this.searchParams.query) {
        return this.status.params.query = '';
      }
    };


    /*
    removeFilter
    
    Removes some filter criteria.
    
    @param {String} key: the facet key you are filtering
    @param {String | Object} value: the filtering criteria you are removing
    @api public
     */

    Controller.prototype.removeFilter = function(key, value) {
      var index, results;
      this.status.currentPage = 1;
      if (this.status.params.filters && this.status.params.filters[key]) {
        if (this.status.params.filters[key].constructor === Object) {
          delete this.status.params.filters[key];
        } else if (this.status.params.filters[key].constructor === Array) {
          index = this.status.params.filters[key].indexOf(value);
          while (index >= 0) {
            this.status.params.filters[key].splice(index, 1);
            index = this.status.params.filters[key].indexOf(value);
          }
        }
      }
      if (this.searchParams.filters && this.searchParams.filters[key]) {
        if (this.searchParams.filters[key].constructor === Object) {
          return delete this.searchParams.filters[key];
        } else if (this.searchParams.filters[key].constructor === Array) {
          index = this.searchParams.filters[key].indexOf(value);
          results = [];
          while (index >= 0) {
            this.searchParams.filters[key].splice(index, 1);
            results.push(index = this.searchParams.filters[key].indexOf(value));
          }
          return results;
        }
      }
    };


    /*
    setSearchParam
    
    Removes some filter criteria.
    
    @param {String} key: the param key
    @param {Mixed} value: the value
    @api public
     */

    Controller.prototype.setSearchParam = function(key, value) {
      return this.searchParams[key] = value;
    };


    /*
    addwidget
    
    Adds a new widget to the controller and reference the
    controller from the widget.
    
    @param {doofinder.widget} widget: the widget you are adding.
    @api public
     */

    Controller.prototype.addWidget = function(widget) {
      this.widgets.push(widget);
      return widget.init(this);
    };


    /*
    This method calls to /stats/click
    service for accounting the
    clicks to a product
    
    @param {String} productId
    @param {Object} options
    @param {Function} callback
    
    @api public
     */

    Controller.prototype.registerClick = function(productId, arg1, arg2) {
      var callback, options;
      callback = (function(err, res) {});
      options = {};
      if (typeof arg2 === 'undefined' && typeof arg1 === 'function') {
        callback = arg1;
      } else if (typeof arg2 === 'undefined' && typeof arg1 === 'object') {
        options = arg1;
      } else if (typeof arg2 === 'function' && typeof arg1 === 'object') {
        callback = arg2;
        options = arg1;
      }
      if (!options.query) {
        options.query = this.status.params.query;
      }
      return this.client.registerClick(productId, options, callback);
    };


    /*
    This method calls to /stats/init_session
    service for init a user session
    
    @param {String} sessionId
    @param {Function} callback
    
    @api public
     */

    Controller.prototype.registerSession = function(sessionId, callback) {
      if (callback == null) {
        callback = (function(err, res) {});
      }
      return this.client.registerSession(sessionId, callback);
    };


    /*
    This method calls to /stats/checkout
    service for init a user session
    
    @param {String} sessionId
    @param {Object} options
    @param {Function} callback
    
    @api public
     */

    Controller.prototype.registerCheckout = function(sessionId, arg1, arg2) {
      var callback, options;
      callback = (function(err, res) {});
      options = {};
      if (typeof arg2 === 'undefined' && typeof arg1 === 'function') {
        callback = arg1;
      } else if (typeof arg2 === 'undefined' && typeof arg1 === 'object') {
        options = arg1;
      } else if (typeof arg2 === 'function' && typeof arg1 === 'object') {
        callback = arg2;
        options = arg1;
      }
      return this.client.registerCheckout(sessionId, options, callback);
    };


    /*
    hit
    
    Increment the hit counter when a product is clicked.
    
    @param {String} dfid: the unique identifier present in the search result
    @param {Function} callback
     */

    Controller.prototype.hit = function(sessionId, type, dfid, query, callback) {
      if (dfid == null) {
        dfid = "";
      }
      if (query == null) {
        query = this.status.params.query;
      }
      if (callback == null) {
        callback = function() {};
      }
      return this.client.hit(sessionId, type, dfid, query, callback);
    };


    /*
    options
    
    Retrieves the SearchEngine options
    
    @param {Function} callback
     */

    Controller.prototype.options = function(arg1, arg2) {
      return this.client.options(arg1, arg2);
    };


    /*
    bind
    
    Method to add and event listener
    @param {String} event
    @param {Function} callback
    @api public
     */

    Controller.prototype.bind = function(event, callback) {
      return $(this).on(event, callback);
    };


    /*
    trigger
    
    Method to trigger an event
    @param {String} event
    @param {Array} params
    @api public
     */

    Controller.prototype.trigger = function(event, params) {
      return $(this).trigger(event, params);
    };


    /*
    setStatusFromString
    
    Fills in the status from queryString
    and searches.
     */

    Controller.prototype.setStatusFromString = function(queryString, prefix) {
      var searchParams;
      if (prefix == null) {
        prefix = "#/search/";
      }
      this.status.firstQueryTriggered = true;
      this.status.lastPageReached = false;
      searchParams = extend(true, {}, this.searchParams || {});
      this.status.params = extend(true, searchParams, qs.parse(queryString.replace("" + prefix, "")) || {});
      this.status.params.query_counter = 1;
      this.status.currentPage = 1;
      this.refresh();
      return this.status.params.query;
    };


    /*
    statusQueryString
    
    Method to represent current status
    with a queryString
     */

    Controller.prototype.statusQueryString = function(prefix) {
      var params;
      if (prefix == null) {
        prefix = "#/search/";
      }
      params = extend(true, {}, this.status.params);
      delete params.transformer;
      delete params.rpp;
      delete params.query_counter;
      delete params.page;
      return "" + prefix + (qs.stringify(params));
    };

    return Controller;

  })();

  module.exports = Controller;

}).call(this);
