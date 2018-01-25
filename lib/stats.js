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
     * @param  {String}  	session_id  Session id.
     *
     * @param  {Function} callback    Optional callback to be called when the
     *                                response is received. First param is the
     *                                error, if any, and the second one is the
     *                                response, if any.
     * @public
     */

    Stats.prototype.registerSession = function(session_id, callback) {
      return this.client.stats("init", {
        session_id: session_id
      }, callback);
    };


    /**
     * Registers a click on a search result for the specified search query.
     *
     * @param  {String}  	session_id  Session id.
     * @param  {String}   dfid        Doofinder's internal ID for the result.
     * @param  {String}   query       Optional. Search terms.
     * @param  {Function} callback    Optional callback to be called when the
     *                                response is received. First param is the
     *                                error, if any, and the second one is the
     *                                response, if any.
     * @public
     */

    Stats.prototype.registerClick = function(session_id, dfid, query, callback) {
      var params;
      params = {
        session_id: session_id,
        dfid: dfid,
        query: query || ""
      };
      return this.client.stats("click", params, callback);
    };


    /**
     * Registers a checkout.
     *
     * @param  {String}  	session_id  Session id.
     * @param  {Function} callback    Optional callback to be called when the
     *                                response is received. First param is the
     *                                error, if any, and the second one is the
     *                                response, if any.
     * @public
     */

    Stats.prototype.registerCheckout = function(session_id, callback) {
      return this.client.stats("checkout", {
        session_id: session_id
      }, callback);
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
      if (eventName == null) {
        throw this.error("eventName is required");
      }
      if (bannerId == null) {
        throw this.error("bannerId is required");
      }
      return this.client.stats("banner_" + eventName, {
        banner_id: "" + bannerId
      }, (function(_this) {
        return function(err, res) {
          return typeof callback === "function" ? callback(err, res) : void 0;
        };
      })(this));
    };

    return Stats;

  })();

  module.exports = Stats;

}).call(this);
