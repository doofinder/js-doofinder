
/*
client.coffee
author: @ecoslado
2015 04 01
 */

(function() {
  var Client, http;

  http = require("http");


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
    function Client(hashid, apiKey, version, type, address) {
      var zone, zoneApiKey;
      this.hashid = hashid;
      this.type = type;
      if (this.version == null) {
        this.version = version;
      }
      if (this.version == null) {
        this.version = 5;
      }
      this.params = {};
      this.filters = {};
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
      if (query === null || !query.constructor === String) {
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
      return this._sanitizeQuery(query, function(res) {
        var filterKey, filterTerms, headers, options, paramKey, paramValue, processResponse, queryString, req;
        params.query = res;
        headers = {};
        if (_this.apiKey) {
          headers['api token'] = _this.apiKey;
        }
        _this.params = {};
        _this.filters = {};
        _this.sort = [];
        for (paramKey in params) {
          paramValue = params[paramKey];
          if (paramKey === "filters") {
            for (filterKey in paramValue) {
              filterTerms = paramValue[filterKey];
              _this.addFilter(filterKey, filterTerms);
            }
          } else if (paramKey === "sort") {
            _this.sort = paramValue;
          } else {
            _this.addParam(paramKey, paramValue);
          }
        }
        queryString = _this.makeQueryString();
        options = {
          host: _this.url,
          path: "/" + _this.version + "/search?" + queryString,
          headers: headers
        };
        if (_this.url.split(':').length > 1) {
          options.host = _this.url.split(':')[0];
          options.port = _this.url.split(':')[1];
        }
        processResponse = function(res) {
          var data;
          if (res.statusCode >= 400) {
            return callback(res.statusCode, null);
          } else {
            data = "";
            res.on('data', function(chunk) {
              return data += chunk;
            });
            res.on('end', function() {
              return callback(null, JSON.parse(data));
            });
            return res.on('error', function(err) {
              return callback(err, null);
            });
          }
        };
        req = http.request(options, _this.__processResponse(callback));
        return req.end();
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

    Client.prototype.addFilter = function(filterKey, filterValues) {
      return this.filters[filterKey] = filterValues;
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
    makeQueryString
    
    This method returns a
    querystring for adding
    to Search API request.
    
    @returns {String} querystring
    @api private
     */

    Client.prototype.makeQueryString = function() {
      var elem, facet, j, k, key, l, len, len1, querystring, ref, ref1, ref2, ref3, ref4, term, v, value;
      querystring = encodeURI("hashid=" + this.hashid);
      if (this.type && this.type instanceof Array) {
        ref = this.type;
        for (key in ref) {
          value = ref[key];
          querystring += encodeURI("&type=" + value);
        }
      } else if (this.type && this.type.constructor === String) {
        querystring += encodeURI("&type=" + this.type);
      }
      ref1 = this.params;
      for (key in ref1) {
        value = ref1[key];
        querystring += encodeURI("&" + key + "=" + value);
      }
      ref2 = this.filters;
      for (key in ref2) {
        value = ref2[key];
        if (value.constructor === Object) {
          for (k in value) {
            v = value[k];
            querystring += encodeURI("&filter[" + key + "][" + k + "]=" + v);
          }
        }
        if (value.constructor === Array) {
          for (j = 0, len = value.length; j < len; j++) {
            elem = value[j];
            querystring += encodeURI(("&filter[" + key + "]=") + escape(elem));
          }
        }
      }
      if (this.sort && this.sort.constructor === Array) {
        ref3 = this.sort;
        for (l = 0, len1 = ref3.length; l < len1; l++) {
          value = ref3[l];
          for (facet in value) {
            term = value[facet];
            querystring += encodeURI("&sort[" + (this.sort.indexOf(value)) + "][" + facet + "]=" + term);
          }
        }
      } else if (this.sort && this.sort.constructor === Object) {
        ref4 = this.sort;
        for (key in ref4) {
          value = ref4[key];
          querystring += encodeURI("&sort[" + key + "]=" + value);
        }
      }
      return querystring;
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

    Client.prototype.hit = function(dfid, query, callback) {
      var headers, options, req;
      if (query == null) {
        query = "";
      }
      if (callback == null) {
        callback = function(err, res) {};
      }
      headers = {};
      if (this.apiKey) {
        headers['api token'] = _this.apiKey;
      }
      options = {
        host: this.url,
        path: "/" + this.version + "/hit/" + this.hashid + "/" + dfid + "/" + (encodeURIComponent(query)) + "?random=" + (new Date().getTime()),
        headers: headers
      };
      if (this.url.split(':').length > 1) {
        options.host = this.url.split(':')[0];
        options.port = this.url.split(':')[1];
      }
      req = http.request(options, this.__processResponse(callback));
      return req.end();
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

    Client.prototype.options = function(callback) {
      var headers, options, req;
      if (callback == null) {
        callback = function(err, res) {};
      }
      headers = {};
      if (this.apiKey) {
        headers['api token'] = _this.apiKey;
      }
      options = {
        host: this.url,
        path: "/" + this.version + "/options/" + this.hashid,
        headers: headers
      };
      if (this.url.split(':').length > 1) {
        options.host = this.url.split(':')[0];
        options.port = this.url.split(':')[1];
      }
      req = http.request(options, this.__processResponse(callback));
      return req.end();
    };


    /*
    Callback function will be passed as argument to search
    and will be returned with response body
    
    @param {Object} res: the response
    @api private
     */

    Client.prototype.__processResponse = function(callback) {
      return function(res) {
        var data;
        if (res.statusCode >= 400) {
          return callback(res.statusCode, null);
        } else {
          data = "";
          res.on('data', function(chunk) {
            return data += chunk;
          });
          res.on('end', function() {
            return callback(null, JSON.parse(data));
          });
          return res.on('error', function(err) {
            return callback(err, null);
          });
        }
      };
    };

    return Client;

  })();

  module.exports = Client;

}).call(this);
