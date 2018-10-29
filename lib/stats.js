(function() {
  var Client, Session, Stats, errors, uniqueId,
    slice = [].slice;

  errors = require("./util/errors");

  uniqueId = require("./util/uniqueid");

  Client = require("./client");

  Session = (require("./session")).Session;


  /**
   * Helper class to wrap calls to the Doofinder stats API endpoint.
   */

  Stats = (function() {

    /**
     * Stats client constructor.
     * @param  {Client}   @client  Doofinder's Client instance
     * @param  {Session}  @session Session instance
     */
    function Stats(client) {
      this.client = client;
      if (!(this.client instanceof Client)) {
        throw errors.error("First parameter must be a Client object!", this);
      }
    }


    /**
     * Wrapper of @client.stats function.
     *
     * WARNING: This should be called ONLY if the user has performed a search.
     *          That's why this is usually called when the user has stopped
     *          typing in the search box.
     *
     * @param  {String}  	sessionId Session id.
     * @param  {Function} callback  Optional callback to be called when the
     *                              response is received. First param is the
     *                              error, if any, and the second one is the
     *                              response, if any.
     * @public
     */

    Stats.prototype.registerSession = function(sessionId, callback) {
      return this.client.stats("init", {
        session_id: sessionId
      }, function(err, res) {
        return typeof callback === "function" ? callback(err, res) : void 0;
      });
    };


    /**
     * Registers a click on a search result for the specified search query.
     *
     * stats = new doofinder.Stats(client);
     * stats.registerClick(sessionId, id, datatype, query, callback);
     * stats.registerClick(sessionId, dfid, query, callback);
     *
     * @param  {String}  	sessionId Session id.
     * @param  {String}   id        Id of the result or Doofinder's internal ID
     *                              for the result.
     * @param  {String}   datatype  Optional. If the id is not a Doofinder id
     *                              this argument is required.
     * @param  {String}   query     Optional. Search terms.
     * @param  {String}   custom_results_id Optional. Id of the custom results
     *                                      that produced the current set of
     *                                      results, including the current one
     *                                      being clicked.
     * @param  {Function} callback  Optional callback to be called when the
     *                              response is received. First param is the
     *                              error, if any, and the second one is the
     *                              response, if any.
     * @public
     */

    Stats.prototype.registerClick = function() {
      var args, callback, i, j, key, keys, len, len1, params, required, sessionId;
      sessionId = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
      errors.requireVal(sessionId, "sessionId");
      if (args.length === 0) {
        errors.requireVal(null, "dfid or (id + datatype)");
      } else if (uniqueId.dfid.isValid(args[0])) {
        required = ['dfid'];
      } else {
        required = ['id', 'datatype'];
      }
      keys = required.concat(['query']);
      params = {
        session_id: sessionId
      };
      for (i = 0, len = keys.length; i < len; i++) {
        key = keys[i];
        params[key] = args.shift();
      }
      if (params.query == null) {
        params.query = "";
      }
      for (j = 0, len1 = required.length; j < len1; j++) {
        key = required[j];
        errors.requireVal(params[key], key);
      }
      if (typeof args[0] !== "function") {
        params['custom_results_id'] = args.shift();
      }
      callback = args.shift();
      return this.client.stats("click", params, function(err, res) {
        return typeof callback === "function" ? callback(err, res) : void 0;
      });
    };


    /**
     * Registers a checkout.
     *
     * @param  {String}  	sessionId Session id.
     * @param  {Function} callback  Optional callback to be called when the
     *                              response is received. First param is the
     *                              error, if any, and the second one is the
     *                              response, if any.
     * @public
     */

    Stats.prototype.registerCheckout = function(sessionId, callback) {
      errors.requireVal(sessionId, "sessionId");
      return this.client.stats("checkout", {
        session_id: sessionId
      }, function(err, res) {
        return typeof callback === "function" ? callback(err, res) : void 0;
      });
    };


    /**
     * Registers an event for a banner
     * @param  {String}   eventName Name of the event.
     *                              - display
     *                              - click
     * @param  {Number}   bannerId  Id of the banner.
     * @param  {Function} callback  Optional callback to be called when the
     *                              response is received. First param is the
     *                              error, if any, and the second one is the
     *                              response, if any.
     * @return {undefined}
     * @public
     */

    Stats.prototype.registerBannerEvent = function(eventName, bannerId, callback) {
      errors.requireVal(eventName, "eventName");
      errors.requireVal(bannerId, "bannerId");
      return this.client.stats("banner_" + eventName, {
        banner_id: bannerId
      }, function(err, res) {
        return typeof callback === "function" ? callback(err, res) : void 0;
      });
    };

    return Stats;

  })();

  module.exports = Stats;

}).call(this);
