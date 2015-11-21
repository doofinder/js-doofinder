
/*
 * Created by Kike Coslado on 26/10/15.
 */

(function() {
  var Controller, extend;

  extend = require('./util/extend').extend;


  /*
  Controller
    
  This class uses the client to
  to retrieve the data and the displayers
  to paint them.
   */

  Controller = (function() {

    /*
    Controller constructor
    
    @param {doofinder.Client} client
    @param {doofinder.Displayer | Array} displayers
    @param {Object} initialParams
    @api public
     */
    function Controller(client, displayers, initialParams) {
      var displayer, i, len;
      if (initialParams == null) {
        initialParams = {};
      }
      this.client = client;
      this.displayers = [];
      if (displayers instanceof Array) {
        for (i = 0, len = displayers.length; i < len; i++) {
          displayer = displayers[i];
          this.addDisplayer(displayer);
        }
      } else {
        this.addDisplayer(displayers);
      }
      this.initialParams = extend(initialParams, {
        query_counter: 0
      });
      this.status = {
        params: this.initialParams,
        query: '',
        currentPage: 0,
        firstQueryTriggered: false
      };
    }


    /*
    __triggerAll
    this function triggers an event
    for every resultDisplayer
    
    @param {String} event: the event name
    @param {Array} params: the params will be passed
      to the listeners
    @api private
     */

    Controller.prototype.__triggerAll = function(event, params) {
      var displayer, i, len, ref, results;
      ref = this.displayers;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        displayer = ref[i];
        results.push(displayer.trigger(event, params));
      }
      return results;
    };


    /*
    __search
    this method invokes Client's search method for
    retrieving the data and use Displayer's replace or 
    append to show them.
    
    @param {String} event: the event name
    @param {Array} params: the params will be passed
      to the listeners
    @api private
     */

    Controller.prototype.__search = function(next) {
      var lastPageReached, params, query, self;
      if (next == null) {
        next = false;
      }
      this.status.params.query_counter++;
      query = this.status.query;
      params = this.status.params;
      params.page = this.status.currentPage;
      self = this;
      lastPageReached = true;
      return this.client.search(query, params, function(err, res) {
        var displayer, i, len, ref;
        self.__triggerAll("df:results_received", res);
        if (res.query_counter === self.status.params.query_counter) {
          ref = self.displayers;
          for (i = 0, len = ref.length; i < len; i++) {
            displayer = ref[i];
            if (next) {
              displayer.renderNext(res);
            } else {
              displayer.render(res);
            }
          }
          if (res.results.length < self.status.params.rpp) {
            return self.status.lastPageReached = lastPageReached;
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
      if (!this.status) {
        this.status = {};
      }
      this.status.params = extend(this.initialParams, params);
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
      return this.__search();
    };


    /*
    addFilter
    
    Makes a search call adding new filter criteria.
    
    @param {String} key: the facet key you are filtering
    @param {String | Object} value: the filtering criteria
    @api public
     */

    Controller.prototype.addFilter = function(key, value) {
      if (value.constructor !== Object || value.constructor !== String) {
        throw Error("wrong value. Object or String expected, " + value.constructor + " given");
      }
      if (!this.status.params.filters) {
        this.status.params.filters = {};
      }
      if (value.constructor === Object) {
        this.status.params.filters[key] = value;
      } else if (!this.status.params.filters[key]) {
        this.status.params.filters[key] = [value];
      } else {
        this.status.params.filters[key].push(value);
      }
      return this.__search();
    };


    /*
    removeFilter
    
    Makes a search call removing some filter criteria.
    
    @param {String} key: the facet key you are filtering
    @param {String | Object} value: the filtering criteria you are removing
    @api public
     */

    Controller.prototype.removeFilter = function(key, value) {
      var index;
      if (!this.status.params.filters && !this.status.params.filters[key]) {

      } else if (this.status.params.filters[key].constructor === Object) {
        delete this.status.params.filters[key];
      } else if (this.status.params.filters[key].constructor === Array && this.status.params.filters[key].indexOf(value) >= 0) {
        index = this.status.params.filters[key].indexOf(value);
        this.status.params.filters[key].pop(index);
      }
      return this.__search();
    };


    /*
    addDisplayer
    
    Adds a new displayer to the controller and reference the 
    controller from the displayer.
    
    @param {doofinder.Displayer} displayer: the displayer you are adding.
    @api public
     */

    Controller.prototype.addDisplayer = function(displayer) {
      this.displayers.push(displayer);
      return displayer.controller = this;
    };


    /*
    start
    
    Executes all displayer's starts. Bind events
    
    @api public
     */

    Controller.prototype.start = function() {
      var displayer, i, len, ref, results;
      ref = this.displayers;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        displayer = ref[i];
        results.push(displayer.start());
      }
      return results;
    };

    return Controller;

  })();

  module.exports = Controller;

}).call(this);
