
/*
 * Created by Kike Coslado on 26/10/15.
 */

(function() {
  var Controller, jqDf;

  jqDf = require('jquery');


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
      this.initialParams = initialParams != null ? initialParams : {};
      this.client = client;
      if (displayers instanceof Array) {
        this.displayers = displayers;
      } else {
        this.displayers = [displayers];
      }
      this.status = {
        params: this.initialParams || {},
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

    Controller.prototype.__search = function(replace) {
      var lastPageReached, params, query, self;
      query = this.status.query;
      params = this.status.params || {};
      params.page = this.status.currentPage;
      self = this;
      lastPageReached = true;
      return this.client.search(query, params, function(err, res) {
        var displayer, i, len, ref;
        self.__triggerAll("df:results_received", [res]);
        ref = self.displayers;
        for (i = 0, len = ref.length; i < len; i++) {
          displayer = ref[i];
          if (replace) {
            displayer.replace(res);
          } else {
            displayer.append(res);
          }
        }
        if (res.results.length < self.status.params.rpp) {
          return self.status.lastPageReached = lastPageReached;
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

    Controller.prototype.search = function(query) {
      this.__triggerAll("df:search");
      if (query) {
        this.status.query = query;
      }
      if (!this.status) {
        this.status = {};
      }
      this.status.params = this.initialParams;
      this.status.currentPage = 1;
      this.status.firstQueryTriggered = true;
      this.status.lastPageReached = false;
      return this.__search(true);
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
      if (this.status.firstQueryTriggered && this.status.currentPage > 0) {
        this.status.currentPage++;
        return this.__search(replace);
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
        return this.__search(true);
      }
    };

    Controller.prototype.refresh = function() {
      return this.__search(true);
    };

    return Controller;

  })();

  module.exports = Controller;

}).call(this);
