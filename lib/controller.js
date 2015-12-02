
/*
 * Created by Kike Coslado on 26/10/15.
 */

(function() {
  var $, Controller;

  $ = require("./util/jquery");


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
    @param {Object} initialParams
    @api public
     */
    function Controller(client, widgets, initialParams) {
      var i, len, widget;
      if (initialParams == null) {
        initialParams = {};
      }
      this.client = client;
      this.widgets = [];
      if (widgets instanceof Array) {
        for (i = 0, len = widgets.length; i < len; i++) {
          widget = widgets[i];
          this.addWidget(widget);
        }
      } else {
        this.addWidget(widgets);
      }
      this.initialParams = $.extend(true, initialParams, {
        query_counter: 0
      });
      this.status = {
        params: this.initialParams,
        query: '',
        currentPage: 0,
        firstQueryTriggered: false,
        lastPageReached: false
      };
    }


    /*
    __triggerAll
    this function triggers an event
    for every resultwidget
    
    @param {String} event: the event name
    @param {Array} params: the params will be passed
      to the listeners
    @api private
     */

    Controller.prototype.__triggerAll = function(event, params) {
      var i, len, ref, results, widget;
      ref = this.widgets;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        widget = ref[i];
        results.push(widget.trigger(event, params));
      }
      return results;
    };


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
      var _this, params, query;
      if (next == null) {
        next = false;
      }
      this.status.params.query_counter++;
      query = this.status.query;
      params = this.status.params;
      params.page = this.status.currentPage;
      _this = this;
      return this.client.search(query, params, function(err, res) {
        var i, len, ref, widget;
        _this.__triggerAll("df:results_received", res);
        if (res.query_counter === _this.status.params.query_counter) {
          ref = _this.widgets;
          for (i = 0, len = ref.length; i < len; i++) {
            widget = ref[i];
            if (next) {
              widget.renderNext(res);
            } else {
              widget.render(res);
            }
          }
          if (res.results.length < _this.status.params.rpp) {
            return _this.status.lastPageReached = true;
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
      if (params == null) {
        params = {};
      }
      this.__triggerAll("df:search");
      if (query) {
        this.status.query = query;
      }
      this.status.params = $.extend(true, this.initialParams, params);
      this.status.currentPage = 1;
      this.status.firstQueryTriggered = true;
      this.status.lastPageReached = false;
      return this.__search();
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
      this.__triggerAll("df:next_page");
      console.log(this.status.firstQueryTriggered, this.status.currentPage, this.status.lastPageReached);
      if (this.status.firstQueryTriggered && this.status.currentPage > 0 && !this.status.lastPageReached) {
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
      this.__triggerAll("df:get_page");
      if (this.status.firstQueryTriggered && this.status.currentPage > 0) {
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
      this.__triggerAll("df:search");
      return this.__search();
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
        return this.status.params.filters[key] = value;
      } else if (!this.status.params.filters[key]) {
        return this.status.params.filters[key] = [value];
      } else {
        return this.status.params.filters[key].push(value);
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
      if (!this.status.params.filters && !this.status.params.filters[key]) {

      } else if (this.status.params.filters[key].constructor === Object) {
        return delete this.status.params.filters[key];
      } else if (this.status.params.filters[key].constructor === Array) {
        index = this.status.params.filters[key].indexOf(value);
        results = [];
        while (index >= 0) {
          this.status.params.filters[key].pop(index);
          results.push(index = this.status.params.filters[key].indexOf(value));
        }
        return results;
      }
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

    return Controller;

  })();

  module.exports = Controller;

}).call(this);
