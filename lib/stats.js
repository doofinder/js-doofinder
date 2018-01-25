(function() {
  var Client, Session, Stats, errors, uniqueId;

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
     * @param  {String}  	sessionId Session id.
     * @param  {String}   dfid      Doofinder's internal ID for the result.
     * @param  {String}   query     Optional. Search terms.
     * @param  {Function} callback  Optional callback to be called when the
     *                              response is received. First param is the
     *                              error, if any, and the second one is the
     *                              response, if any.
     * @public
     */

    Stats.prototype.registerClick = function(sessionId, dfid, query, callback) {
      var params;
      errors.requireVal(sessionId, "sessionId");
      errors.requireVal(dfid, "dfid");
      params = {
        session_id: sessionId,
        dfid: dfid,
        query: query || ""
      };
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
