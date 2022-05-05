(function() {
  var Client, HttpClient, Thing, errors, md5, merge, qs;

  md5 = require("md5");

  qs = require("qs");

  errors = require("./util/errors");

  HttpClient = require("./util/http");

  merge = require("./util/merge");

  Thing = require("./util/thing");


  /**
   * This class allows searching and sending stats using the Doofinder service.
   */

  Client = (function() {
    Client.apiVersion = "5";


    /**
     * Constructor
     *
     * @param  {String} @hashid Unique ID of the Search Engine.
     * @param  {Object} options Options object.
     *
     *                          {
     *                            zone:    "eu1"            # Search Zone (eu1,
     *                                                      # us1, ...).
     *
     *                            apiKey:  "eu1-abcd..."    # Complete API key,
     *                                                      # including zone and
     *                                                      # secret key for auth.
     *
     *                            address: "localhost:4000" # Force server address
     *                                                      # for development
     *                                                      # purposes.
     *
     *                            version: "5"              # API version. Better
     *                                                      # not to touch this.
     *                                                      # For development
     *                                                      # purposes.
     *
     *                            headers: {                # You know, for HTTP.
     *                              "Origin": "...",
     *                              "...": "..."
     *                            }
     *                          }
     *
     *                          If you use `apiKey` you can omit `zone` but one of
     *                          them is required.
     *
     * @public
     */

    function Client(hashid, options) {
      var address, forceSSL, host, message, port, protocol, ref, ref1, ref2, secret, zone;
      this.hashid = hashid;
      if (options == null) {
        options = {};
      }
      ref = (options.apiKey || options.zone || "").split("-"), zone = ref[0], secret = ref[1];
      secret = secret ? "Token " + secret : null;
      if (!zone) {
        if (secret) {
          message = "invalid `apiKey`";
        } else {
          message = "`apiKey` or `zone` must be defined";
        }
        throw errors.error(message, this);
      }
      ref1 = (options.address || (zone + "-search.doofinder.com")).split("://"), protocol = ref1[0], address = ref1[1];
      if (address == null) {
        address = protocol;
        protocol = null;
      }
      ref2 = address.split(":"), host = ref2[0], port = ref2[1];
      this.requestOptions = {
        host: host,
        port: port,
        headers: options.headers || {}
      };
      forceSSL = false;
      if (secret != null) {
        this.requestOptions.headers["Authorization"] = secret;
      }
      if (protocol != null) {
        this.requestOptions.protocol = protocol + ":";
      }
      if (protocol === "https") {
        forceSSL = true;
      }
      this.httpClient = new HttpClient(forceSSL);
      this.version = "" + (options.version || this.constructor.apiVersion);
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

    Client.prototype.request = function(resource, callback, payload) {
      var options;
      options = merge({
        path: resource
      }, this.requestOptions);
      return this.httpClient.request(options, callback, payload);
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
     * Peform a get items query request
     * @params {Object} list of dfids to get
     * @param  {Object}   params   Parameters for the request. Optional.
     * @return {http.ClientRequest}
     * @public
     */

    Client.prototype.getItems = function(items, params, callback) {
      var querystring;
      querystring = this.__buildSearchQueryString("", params);
      return this.request("/" + this.version + "/search?" + querystring, callback, {
        items: items
      });
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
      querystring = qs.stringify(merge(defaultParams, params || {}));
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
        hashid: this.hashid
      };
      queryParams = merge(defaultParams, params || {}, {
        query: query
      });
      if ((Thing.is.array(queryParams.type)) && queryParams.type.length === 1) {
        queryParams.type = queryParams.type[0];
      }
      if ((Thing.is.plainObject(queryParams.sort)) && (Object.keys(queryParams.sort)).length > 1) {
        throw errors.error("To sort by multiple fields use an Array of Objects", this);
      }
      return qs.stringify(queryParams, {
        skipNulls: false
      });
    };

    return Client;

  })();

  module.exports = Client;

}).call(this);
