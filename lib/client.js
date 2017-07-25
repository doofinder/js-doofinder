(function() {
  var Client, HttpClient, extend, md5, qs;

  extend = require("extend");

  md5 = require("md5");

  qs = require("qs");

  HttpClient = require("./util/http");


  /**
   * This class allows searching and sending stats using the Doofinder service.
   */

  Client = (function() {
    Client.prototype.error = function(message) {
      throw new Error(this.constructor.name + ": " + message);
    };


    /**
     * Constructor
     * @param  {String}       hashid  Unique ID of the Search Engine.
     * @param  {String}       apiKey  Search zone (eu1, us1) or full API key
     *                                (eu1-...).
     * @param  {Number}       version API version.
     * @param  {String|Array} type    Restricts search to one or more data types.
     * @param  {[type]}       address Search server endpoint. Used by the
     *                                development team.
     * @public
     */

    function Client(hashid, zoneOrKey, version, type, address) {
      var apiKey, host, port, ref, ref1, zone;
      this.hashid = hashid;
      if (version == null) {
        version = 5;
      }
      this.type = type;
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
      this.version = "" + (parseInt(version, 10));
      this.httpClient = new HttpClient(apiKey != null);
    }


    /**
     * Performs a HTTP request to the endpoint specified with the default options
     * of the client.
     *
     * @param  {String}   resource Resource to be called by GET.
     * @param  {Function} callback Callback to be called when the response is
     *                             received. First param is the error, if any,
     *                             and the second one is the response, if any.
     * @return {http.ClientRequest}
     * @public
     */

    Client.prototype.request = function(resource, callback) {
      var options;
      options = extend(true, {
        path: resource
      }, this.defaultOptions);
      return this.httpClient.request(options, callback);
    };


    /**
     * Performs a search request.
     *
     * @param  {String}   query    Search terms.
     * @param  {Object}   params   Parameters for the request. Optional.
     *
     *                             params =
     *                               page: Number
     *                               rpp: Number
     *                               type: String | [String]
     *                               filter:
     *                                 field: [String]
     *                                 field:
     *                                   from: Number
     *                                   to: Number
     *                               exclude:
     *                                 field: [String]
     *                                 field:
     *                                   from: Number
     *                                   to: Number
     *                               sort: String
     *                               sort:
     *                                 field: "asc" | "desc"
     *                               sort: [{field: "asc|desc"}]
     *
     * @param  {Function} callback Callback to be called when the response is
     *                             received. First param is the error, if any,
     *                             and the second one is the response, if any.
     * @return {http.ClientRequest}
     * @public
     */

    Client.prototype.search = function(query, params, callback) {
      var querystring;
      if (arguments.length === 2) {
        callback = params;
        params = {};
      }
      querystring = this.__buildSearchQueryString(query, params);
      return this.request("/" + this.version + "/search?" + querystring, callback);
    };


    /**
     * Perform a request to get options for a search engine.
     *
     * @param  {String}   suffix   Optional suffix to add to the request URL. Can
     *                             be something like a domain, so the URL looks
     *                             like /<version>/options/<hashid>?example.com.
     * @param  {Function} callback Callback to be called when the response is
     *                             received. First param is the error, if any,
     *                             and the second one is the response, if any.
     * @return {http.ClientRequest}
     * @public
     */

    Client.prototype.options = function(suffix, callback) {
      if (arguments.length === 1) {
        callback = suffix;
        suffix = "";
      }
      suffix = suffix ? "?" + suffix : "";
      return this.request("/" + this.version + "/options/" + this.hashid + suffix, callback);
    };


    /**
     * Performs a request to submit stats events to Doofinder.
     *
     * @param  {String}   eventName Type of stats. Configures the endpoint.
     * @param  {Object}   params    Parameters for the query string.
     * @param  {Function} callback  Callback to be called when the response is
     *                              received. First param is the error, if any,
     *                              and the second one is the response, if any.
     * @return {http.ClientRequest}
     */

    Client.prototype.stats = function(eventName, params, callback) {
      var defaultParams, querystring;
      if (eventName == null) {
        eventName = "";
      }
      defaultParams = {
        hashid: this.hashid,
        random: new Date().getTime()
      };
      querystring = qs.stringify(extend(true, defaultParams, params || {}));
      if (querystring) {
        querystring = "?" + querystring;
      }
      return this.request("/" + this.version + "/stats/" + eventName + querystring, callback);
    };


    /**
     * Creates a search query string for the specified query and parameters
     * intended to be used in the search API endpoint.
     *
     * NOTICE:
     *
     * - qs library encodes "(" and ")" as "%28" and "%29" although is not
     *   needed. Encoded parentheses must be supported in the search endpoint.
     * - Iterating objects doesn't ensure the order of the keys so they can't be
     *   reliabily used to specify sorting in multiple fields. That's why this
     *   method validates sorting and raises an exception if the value is not
     *   valid.
     *
     *   - sort: field                                         [OK]
     *   - sort: {field: 'asc|desc'}                           [OK]
     *   - sort: [{field1: 'asc|desc'}, {field2: 'asc|desc'}]  [OK]
     *   - sort: {field1: 'asc|desc', field2: 'asc|desc'}      [ERR]
     *
     * @param  {String} query  Cleaned search terms.
     * @param  {Object} params Search parameters object.
     * @return {String}        Encoded query string to be used in a search URL.
     * @protected
     */

    Client.prototype.__buildSearchQueryString = function(query, params) {
      var defaultParams, queryParams;
      if (query == null) {
        query = "";
      }
      query = query.replace(/\s+/g, " ");
      if (query !== " ") {
        query = query.trim();
      }
      defaultParams = {
        hashid: this.hashid,
        type: this.type,
        page: 1,
        rpp: 10,
        filter: {},
        exclude: {},
        sort: []
      };
      queryParams = extend(true, defaultParams, params || {}, {
        query: query
      });
      if (queryParams.type instanceof Array && queryParams.type.length === 1) {
        queryParams.type = queryParams.type[0];
      }
      if (typeof queryParams.sort === "object" && !(queryParams.sort instanceof Array) && (Object.keys(queryParams.sort)).length > 1) {
        this.error("To sort by multiple fields use an Array of Objects");
      }
      return qs.stringify(queryParams, {
        skipNulls: true
      });
    };

    return Client;

  })();

  module.exports = Client;

}).call(this);
