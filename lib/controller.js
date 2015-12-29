
/*
 * Created by Kike Coslado on 26/10/15.
 */

(function() {
  var $, Controller, qs,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  $ = require("./util/jquery");

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
    function Controller(client, widgets, searchParams) {
      var i, len, widget;
      if (searchParams == null) {
        searchParams = {};
      }
      this.client = client;
      this.widgets = [];
      if (widgets instanceof Array) {
        for (i = 0, len = widgets.length; i < len; i++) {
          widget = widgets[i];
          this.addWidget(widget);
        }
      } else if (widgets) {
        this.addWidget(widgets);
      }
      this.searchParams = $.extend(true, searchParams, {
        query_counter: 0
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
      params = this.status.params;
      params.page = this.status.currentPage;
      _this = this;
      return this.client.search(params.query, params, function(err, res) {
        var i, len, ref, results, widget;
        if (res.results.length < _this.status.params.rpp) {
          _this.status.lastPageReached = true;
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
      if (query) {
        this.status.params.query = query;
      }
      this.status.params = $.extend(true, this.searchParams, params);
      this.status.currentPage = 1;
      this.status.firstQueryTriggered = true;
      this.status.lastPageReached = false;
      this.trigger("df:search", [this.status.params]);
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
      this.trigger("df:get_page");
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
      this.trigger("df:refresh", [this.status.params]);
      this.status.currentPage = 1;
      this.status.firstQueryTriggered = true;
      this.status.lastPageReached = false;
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
    addParam
    
    Adds new filter criteria.
    
    @param {String} key: the facet key you are filtering
    @param {String | Number} value: the filtering criteria
    @api public
     */

    Controller.prototype.addParam = function(key, value) {
      return this.status.params[key] = value;
    };


    /*
    clearParam
    
    Adds new filter criteria.
    
    @param {String} key: the facet key you are filtering
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
      this.status = {
        params: this.searchParams,
        currentPage: 0,
        firstQueryTriggered: false,
        lastPageReached: false
      };
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
      if (!this.status.params.filters && !this.status.params.filters[key]) {

      } else if (this.status.params.filters[key].constructor === Object) {
        return delete this.status.params.filters[key];
      } else if (this.status.params.filters[key].constructor === Array) {
        index = this.status.params.filters[key].indexOf(value);
        results = [];
        while (index >= 0) {
          this.status.params.filters[key].splice(index, 1);
          results.push(index = this.status.params.filters[key].indexOf(value));
        }
        return results;
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
    hit
    
    Increment the hit counter when a product is clicked.
    
    @param {String} dfid: the unique identifier present in the search result
    @param {Function} callback
     */

    Controller.prototype.hit = function(dfid, callback) {
      return this.client.hit(dfid, this.status.params.query, callback);
    };


    /*
    options
    
    Retrieves the SearchEngine options
    
    @param {Function} callback
     */

    Controller.prototype.options = function(callback) {
      return this.client.options(callback);
    };


    /*
    sendToGA
    
    Send the a command to Google Analytics
    
    @param {Object} gaCommand: the command for GA 
      eventCategory: "xxx" 
      eventLabel: "xxx" 
      eventAction: "xxx"
     */

    Controller.prototype.sendToGA = function(gaCommand) {
      var ga, trackerName;
      if (window._gaq && window._gaq.push) {
        window._gaq.push(['_trackEvent', gaCommand['eventCategory'], gaCommand['eventAction'], gaCommand['eventLabel']]);
        if (gaCommand['eventAction'].indexOf('search') === 0) {
          window._gaq.push(['_trackPageview', '/doofinder/search/' + options.hashid + '?query=' + gaCommand['eventLabel']]);
        } else {
          ga = window[window.GoogleAnalyticsObject] || window.ga;
        }
        if (ga && ga.getAll) {
          trackerName = ga.getAll()[0].get('name');
          ga(trackerName + '.send', 'event', gaCommand);
          if (gaCommand['eventAction'].indexOf('search') === 0) {
            return ga(trackerName + '.send', 'pageview', '/doofinder/search/' + options.hashid + '?query=' + gaCommand['eventLabel']);
          }
        }
      }
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

    Controller.prototype.setStatusFromString = function(queryString) {
      this.status = qs.parse(queryString.replace("#search/", ""));
      this.status.firstQueryTriggered = true;
      this.status.lastPageReached = false;
      this.status.params.query_counter = 15;
      this.status.currentPage = 1;
      this.refresh();
      return this.status.params.query;
    };


    /*
    statusQueryString
    
    Method to represent current status
    with a queryString
     */

    Controller.prototype.statusQueryString = function() {
      return "#search/" + qs.stringify(this.status);
    };

    return Controller;

  })();

  module.exports = Controller;

}).call(this);
