
/*
client.coffee
author: @ecoslado
2015 04 01
 */

(function() {
  var Client, HttpClient, extend, md5,
    slice = [].slice;

  HttpClient = require("./util/http");

  md5 = require("md5");

  extend = require("extend");


  /**
   * This class allows searching and sending stats using the Doofinder service.
   */

  Client = (function() {

    /**
     * Constructor
     * @param  {String}       @hashid  Unique ID of the Search Engine.
     * @param  {String}       apiKey   Search zone (eu1, us1) or full API key
     *                                 (eu1-...).
     * @param  {Number}       @version API version.
     * @param  {String|Array} @type    Restricts search to one or more data types.
     * @param  {[type]}       address  Search server endpoint. Used by the
     *                                 development team.
     * @public
     */
    function Client(hashid, zoneOrKey, version, type1, address) {
      var apiKey, host, port, ref, ref1, zone;
      this.hashid = hashid;
      this.version = version != null ? version : 5;
      this.type = type1;
      ref = zoneOrKey != null ? zoneOrKey.split("-") : ["", void 0], zone = ref[0], apiKey = ref[1];
      if (address == null) {
        address = zone + "-search.doofinder.com";
      }
      ref1 = address.split(":"), host = ref1[0], port = ref1[1];
      this.defaultOptions = {
        host: host,
        port: port,
        headers: {}
      };
      if (apiKey != null) {
        this.defaultOptions.headers.authorization = apiKey;
      }
      this.params = {};
      this.filters = {};
      this.exclude = {};
      this.httpClient = new HttpClient(apiKey != null);
    }


    /**
     * Performs a HTTP request to the endpoint specified with the default options
     * of the client.
     *
     * @param  {String}   url      Endpoint URL.
     * @param  {Function} callback Callback to be called when the response is
     *                             received. First param is the error, if any
     *                             and the second one is the response, if any.
     * @return {http.ClientRequest}
     * @public
     */

    Client.prototype.request = function(url, callback) {
      var options;
      options = extend(true, {
        path: url
      }, this.defaultOptions);
      return this.httpClient.request(options, callback);
    };


    /*
    _sanitizeQuery
    very crude check for bad intentioned queries
    
    checks if words are longer than 55 chars and the whole query is longer than 255 chars
    @param string query
    @return string query if it's ok, empty space if not
     */

    Client.prototype._sanitizeQuery = function(query, callback) {
      var i, maxQueryLength, maxWordLength, ref, x;
      maxWordLength = 55;
      maxQueryLength = 255;
      if (typeof query === "undefined") {
        throw Error("Query must be a defined");
      }
      if (query === null || query.constructor !== String) {
        throw Error("Query must be a String");
      }
      query = query.replace(/ +/g, ' ').replace(/^ +| +$/g, '');
      if (query.length > maxQueryLength) {
        throw Error("Maximum query length exceeded: " + maxQueryLength + ".");
      }
      ref = query.split(' ');
      for (i in ref) {
        x = ref[i];
        if (x.length > maxWordLength) {
          throw Error("Maximum word length exceeded: " + maxWordLength + ".");
        }
      }
      return callback(query);
    };


    /*
    search
    
    Method responsible of executing call.
    
    @param {Object} params
      i.e.:
    
        query: "value of the query"
        page: 2
        rpp: 25
        filters:
          brand: ["nike", "adidas"]
          color: ["blue"]
          price:
            from: 40
            to: 150
    
    @param {Function} callback (err, res)
    @api public
     */

    Client.prototype.search = function() {
      var args, callback, params, query;
      query = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
      if (args.length === 1) {
        params = {};
        callback = args[0];
      } else if (args.length === 2) {
        params = args[0];
        callback = args[1];
      } else {
        throw new Error("A callback is required.");
      }
      if (params.page == null) {
        params.page = 1;
      }
      if (params.rpp == null) {
        params.rpp = 10;
      }
      return this._sanitizeQuery(query, (function(_this) {
        return function(cleaned) {
          var filterKey, filterTerms, paramKey, paramValue, path, queryString;
          params.query = cleaned;
          _this.params = {};
          _this.filters = {};
          _this.sort = [];
          for (paramKey in params) {
            paramValue = params[paramKey];
            if (paramKey === "filters" || paramKey === "exclude") {
              for (filterKey in paramValue) {
                filterTerms = paramValue[filterKey];
                _this.addFilter(filterKey, filterTerms, paramKey);
              }
            } else if (paramKey === "sort") {
              _this.setSort(paramValue);
            } else {
              _this.addParam(paramKey, paramValue);
            }
          }
          queryString = _this.makeQueryString();
          path = "/" + _this.version + "/search?" + queryString;
          return _this.request(path, callback);
        };
      })(this));
    };


    /*
    addParam
    
    This method set simple params
    @param {String} name of the param
    @value {mixed} value of the param
    @api public
     */

    Client.prototype.addParam = function(param, value) {
      if (value !== null) {
        return this.params[param] = value;
      } else {
        return this.params[param] = "";
      }
    };


    /*
    addFilter
    
    This method adds a filter to query
    @param {String} filterKey
    @param {Array|Object} filterValues
    @api public
     */

    Client.prototype.addFilter = function(filterKey, filterValues, type) {
      if (type == null) {
        type = "filters";
      }
      return this[type][filterKey] = filterValues;
    };


    /*
    setSort
    
    This method adds sort to object
    from an object or an array
    
    @param {Array|Object} sort
     */

    Client.prototype.setSort = function(sort) {
      return this.sort = sort;
    };


    /*
    __escapeChars
    
    This method encodes just the chars
    like &, ?, #.
    
    @param {String} word
     */

    Client.prototype.__escapeChars = function(word) {
      return word.replace(/\&/g, "%26").replace(/\?/g, "%3F").replace(/\+/g, "%2B").replace(/\#/g, "%23");
    };


    /*
    makeQueryString
    
    This method returns a
    querystring for adding
    to Search API request.
    
    @returns {String} querystring
    @api private
     */

    Client.prototype.makeQueryString = function() {
      var elem, facet, j, k, key, l, len, len1, len2, m, querystring, ref, ref1, ref2, ref3, ref4, ref5, ref6, segment, term, v, value;
      querystring = encodeURI("hashid=" + this.hashid);
      if (this.type && this.type instanceof Array) {
        ref = this.type;
        for (key in ref) {
          value = ref[key];
          querystring += encodeURI("&type[]=" + value);
        }
      } else if (this.type && this.type.constructor === String) {
        querystring += encodeURI("&type=" + this.type);
      } else if (this.params.type && this.params.type instanceof Array) {
        ref1 = this.params.type;
        for (key in ref1) {
          value = ref1[key];
          querystring += encodeURI("&type[]=" + value);
        }
      } else if (this.params.type && this.params.type.constructor === String) {
        querystring += encodeURI("&type=" + this.type);
      }
      ref2 = this.params;
      for (key in ref2) {
        value = ref2[key];
        if (key === "query") {
          querystring += encodeURI("&" + key + "=");
          querystring += encodeURIComponent(value);
        } else if (key !== "type") {
          querystring += encodeURI("&" + key + "=" + value);
        }
      }
      ref3 = this.filters;
      for (key in ref3) {
        value = ref3[key];
        if (value.constructor === Object) {
          for (k in value) {
            v = value[k];
            querystring += encodeURI("&filter[" + key + "][" + k + "]=" + v);
          }
        }
        if (value.constructor === Array) {
          for (j = 0, len = value.length; j < len; j++) {
            elem = value[j];
            segment = this.__escapeChars(encodeURI("filter[" + key + "]=" + elem));
            querystring += "&" + segment;
          }
        }
      }
      ref4 = this.exclude;
      for (key in ref4) {
        value = ref4[key];
        if (value.constructor === Object) {
          for (k in value) {
            v = value[k];
            querystring += encodeURI("&exclude[" + key + "][" + k + "]=" + v);
          }
        }
        if (value.constructor === Array) {
          for (l = 0, len1 = value.length; l < len1; l++) {
            elem = value[l];
            segment = this.__escapeChars(encodeURI("exclude[" + key + "]=" + elem));
            querystring += "&" + segment;
          }
        }
      }
      if (this.sort && this.sort.constructor === Array) {
        ref5 = this.sort;
        for (m = 0, len2 = ref5.length; m < len2; m++) {
          value = ref5[m];
          for (facet in value) {
            term = value[facet];
            querystring += encodeURI("&sort[" + (this.sort.indexOf(value)) + "][" + facet + "]=" + term);
          }
        }
      } else if (this.sort && this.sort.constructor === String) {
        querystring += encodeURI("&sort=" + this.sort);
      } else if (this.sort && this.sort.constructor === Object) {
        ref6 = this.sort;
        for (key in ref6) {
          value = ref6[key];
          querystring += encodeURI("&sort[" + key + "]=" + value);
        }
      }
      return querystring;
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

    Client.prototype.registerClick = function() {
      var args, callback, datatype, dfid, dfidRe, options, path, productId, query, sessionId;
      productId = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
      callback = (function(err, res) {});
      options = {};
      productId += '';
      if (args.length === 1) {
        if (typeof args[0] === 'function') {
          callback = args[0];
        } else {
          options = args[0];
        }
      } else if (args.length === 2) {
        options = args[0];
        callback = args[1];
      }
      dfidRe = /\w{32}@[\w_-]+@\w{32}/;
      if (dfidRe.exec(productId)) {
        dfid = productId;
      } else {
        datatype = options.datatype || "product";
        dfid = this.hashid + "@" + datatype + "@" + (md5(productId));
      }
      sessionId = options.sessionId || "session_id";
      query = options.query || "";
      path = "/" + this.version + "/stats/click?dfid=" + dfid + "&session_id=" + sessionId + "&query=" + (encodeURIComponent(query));
      path += "&random=" + (new Date().getTime());
      return this.request(path, callback);
    };


    /*
    This method calls to /stats/init_session
    service for init a user session
    
    @param {String} sessionId
    @param {Function} callback
    
    @api public
     */

    Client.prototype.registerSession = function(sessionId, callback) {
      var path;
      if (callback == null) {
        callback = (function(err, res) {});
      }
      path = "/" + this.version + "/stats/init?hashid=" + this.hashid + "&session_id=" + sessionId;
      path += "&random=" + (new Date().getTime());
      return this.request(path, callback);
    };


    /*
    This method calls to /stats/checkout
    service for init a user session
    
    @param {String} sessionId
    @param {Object} options
    @param {Function} callback
    
    @api public
     */

    Client.prototype.registerCheckout = function(sessionId, callback) {
      var path;
      callback = callback || (function(err, res) {});
      path = "/" + this.version + "/stats/checkout?hashid=" + this.hashid + "&session_id=" + sessionId;
      path += "&random=" + (new Date().getTime());
      return this.request(path, callback);
    };


    /*
    This method calls to /stats/banner_<event_type>
    service for registering banner events like display
    or click
    
    @param {String} eventType
    @param {Object} bannerId
    @param {Function} callback
    
    @api public
     */

    Client.prototype.registerBannerEvent = function(eventType, bannerId, callback) {
      var path;
      if (callback == null) {
        callback = (function(err, res) {});
      }
      path = "/" + this.version + "/stats/banner_" + eventType + "?hashid=" + this.hashid + "&banner_id=" + bannerId;
      path += "&random=" + (new Date().getTime());
      return this.request(path, callback);
    };


    /*
    This method calls to /hit
    service for accounting the
    hits in a product
    
    @param {String} dfid
    @param {Object | Function} arg1
    @param {Function} arg2
    @api public
     */

    Client.prototype.options = function() {
      var args, callback, options, path, querystring;
      args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      callback = (function(err, res) {});
      if (args.length === 1) {
        options = {};
        callback = args[0];
      } else if (args.length === 2) {
        options = args[0];
        callback = args[1];
      } else {
        throw new Error("A callback is required.");
      }
      if (typeof options !== "undefined" && options.querystring) {
        querystring = "?" + options.querystring;
      } else {
        querystring = "";
      }
      path = "/" + this.version + "/options/" + this.hashid + querystring;
      return this.request(path, callback);
    };

    return Client;

  })();

  module.exports = Client;

}).call(this);
