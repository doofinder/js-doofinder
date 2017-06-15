
/*
client.coffee
author: @ecoslado
2015 04 01
 */

(function() {
  var Client, HttpClient, md5;

  HttpClient = require("./util/http");

  md5 = require("md5");


  /*
  DfClient
  This class is imported with module
  requirement. Implements the search request
  and returns a json object to a callback function
   */

  Client = (function() {

    /*
    Client constructor
    
    @param {String} hashid
    @param {String} apiKey
    @param {String} version
    @param {String} address
    @api public
     */
    function Client(hashid, apiKey, version, type1, address) {
      var zone, zoneApiKey;
      this.hashid = hashid;
      this.type = type1;
      if (this.version == null) {
        this.version = version;
      }
      if (this.version == null) {
        this.version = 5;
      }
      this.params = {};
      this.filters = {};
      this.exclude = {};
      if (this.url == null) {
        this.url = address;
      }
      if (apiKey) {
        zoneApiKey = apiKey.split('-');
        zone = zoneApiKey[0];
        if (zoneApiKey.length > 1) {
          this.apiKey = zoneApiKey[1];
        }
      } else {
        zone = "";
        this.apiKey = "";
      }
      this.httpClient = new HttpClient((this.apiKey != null) && this.version !== 4);
      if (this.url == null) {
        this.url = zone + "-search.doofinder.com";
      }
    }


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

    Client.prototype.search = function(query, arg1, arg2) {
      var _this, callback, params;
      if (arg1 && arg1.constructor === Function) {
        callback = arg1;
        params = {};
      } else if (arg1 && arg2 && arg1.constructor === Object) {
        callback = arg2;
        params = arg1;
      } else {
        throw new Error("A callback is required.");
      }
      if (params.page == null) {
        params.page = 1;
      }
      if (params.rpp == null) {
        params.rpp = 10;
      }
      _this = this;
      return this._sanitizeQuery(query, function(cleaned) {
        var filterKey, filterTerms, headers, options, paramKey, paramValue, path, queryString;
        params.query = cleaned;
        headers = {};
        if (_this.apiKey) {
          headers[_this.__getAuthHeaderName()] = _this.apiKey;
        }
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
        options = _this.__requestOptions(path);
        return _this.httpClient.request(options, callback);
      });
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

    Client.prototype.registerClick = function(productId, arg1, arg2) {
      var callback, datatype, dfid, dfidRe, options, path, query, sessionId;
      callback = (function(err, res) {});
      options = {};
      productId += '';
      if (typeof arg2 === 'undefined' && typeof arg1 === 'function') {
        callback = arg1;
      } else if (typeof arg2 === 'undefined' && typeof arg1 === 'object') {
        options = arg1;
      } else if (typeof arg2 === 'function' && typeof arg1 === 'object') {
        callback = arg2;
        options = arg1;
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
      options = this.__requestOptions(path);
      return this.httpClient.request(options, callback);
    };


    /*
    This method calls to /stats/init_session
    service for init a user session
    
    @param {String} sessionId
    @param {Function} callback
    
    @api public
     */

    Client.prototype.registerSession = function(sessionId, callback) {
      var options, path;
      if (callback == null) {
        callback = (function(err, res) {});
      }
      path = "/" + this.version + "/stats/init?hashid=" + this.hashid + "&session_id=" + sessionId;
      path += "&random=" + (new Date().getTime());
      options = this.__requestOptions(path);
      return this.httpClient.request(options, callback);
    };


    /*
    This method calls to /stats/checkout
    service for init a user session
    
    @param {String} sessionId
    @param {Object} options
    @param {Function} callback
    
    @api public
     */

    Client.prototype.registerCheckout = function(sessionId, arg1, arg2) {
      var callback, options, path, reqOpts;
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
      path = "/" + this.version + "/stats/checkout?hashid=" + this.hashid + "&session_id=" + sessionId;
      path += "&random=" + (new Date().getTime());
      reqOpts = this.__requestOptions(path);
      return this.httpClient.request(reqOpts, callback);
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
      var path, reqOpts;
      if (callback == null) {
        callback = (function(err, res) {});
      }
      path = "/" + this.version + "/stats/banner_" + eventType + "?hashid=" + this.hashid + "&banner_id=" + bannerId;
      path += "&random=" + (new Date().getTime());
      reqOpts = this.__requestOptions(path);
      return this.httpClient.request(reqOpts, callback);
    };


    /*
    This method calls to /hit
    service for accounting the
    hits in a product
    
    @param {String} dfid
    @param {String} query
    @param {Function} callback
    @api public
     */

    Client.prototype.hit = function(sessionId, eventType, dfid, query, callback) {
      var headers, path, reqOpts;
      if (dfid == null) {
        dfid = "";
      }
      if (query == null) {
        query = "";
      }
      if (callback == null) {
        callback = function(err, res) {};
      }
      headers = {};
      if (this.apiKey) {
        headers[this.__getAuthHeaderName()] = this.apiKey;
      }
      path = "/" + this.version + "/hit/" + sessionId + "/" + eventType + "/" + this.hashid;
      if (dfid !== "") {
        path += "/" + dfid;
      }
      if (query !== "") {
        path += "/" + (encodeURIComponent(query));
      }
      path = path + "?random=" + (new Date().getTime());
      reqOpts = this.__requestOptions(path);
      return this.httpClient.request(reqOpts, callback);
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

    Client.prototype.options = function(arg1, arg2) {
      var callback, options, path, querystring, reqOpts;
      callback = (function(err, res) {});
      if (typeof arg1 === "function" && typeof arg2 === "undefined") {
        callback = arg1;
      } else if (typeof arg1 === "object" && typeof arg2 === "function") {
        options = arg1;
        callback = arg2;
      }
      if (typeof options !== "undefined" && options.querystring) {
        querystring = "?" + options.querystring;
      } else {
        querystring = "";
      }
      path = "/" + this.version + "/options/" + this.hashid + querystring;
      reqOpts = this.__requestOptions(path);
      return this.httpClient.request(reqOpts, callback);
    };


    /*
    Method to make the request options
    
    @param (String) path: request options
    @return (Object) the options object.
    @api private
     */

    Client.prototype.__requestOptions = function(path) {
      var headers, options;
      headers = {};
      if (this.apiKey) {
        headers[this.__getAuthHeaderName()] = this.apiKey;
      }
      options = {
        host: this.url,
        path: path,
        headers: headers
      };
      if (this.url.split(':').length > 1) {
        options.host = this.url.split(':')[0];
        options.port = this.url.split(':')[1];
      }
      return options;
    };


    /*
    Method to obtain security header name
    @return (String) either 'api token' or 'authorization' depending on version
    @api private
     */

    Client.prototype.__getAuthHeaderName = function() {
      if (this.version === 4) {
        return 'api token';
      } else {
        return 'authorization';
      }
    };

    return Client;

  })();

  module.exports = Client;

}).call(this);
