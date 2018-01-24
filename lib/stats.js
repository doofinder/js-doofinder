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
     * Registers a click on a search result for the specified search query.
     *
     * @param  {String}   dfid      Doofinder's internal ID for the result.
     * @param  {String}   query     Search terms.
     * @param  {Function} callback  Optional callback to be called when the
     *                              response is received. First param is the
     *                              error, if any, and the second one is the
     *                              response, if any.
     * @public
     */

    Stats.prototype.registerClick = function(query, session_id, callback) {
      var params;
      params = {
        session_id: session_id,
        query: query
      };
      return this.client.stats("click", params, (function(_this) {
        return function(err, res) {
          return typeof callback === "function" ? callback(err, res) : void 0;
        };
      })(this));
    };


    /**
     * Registers a checkout if session exists.
     * @param  {Function} callback Optional callback to be called when the
     *                             response is received. First param is the
     *                             error, if any, and the second one is the
     *                             response, if any.
     * @return {Boolean}           true if session exists and the request is
     *                             made (doesn't check request success).
     * @public
     */

    Stats.prototype.registerCheckout = function(session_id, callback) {
      if (sessionExists) {
        return this.client.stats("checkout", {
          session_id: session_id
        }, (function(_this) {
          return function(err, res) {
            if (err == null) {
              _this.session.clean();
            }
            return typeof callback === "function" ? callback(err, res) : void 0;
          };
        })(this));
      }
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
