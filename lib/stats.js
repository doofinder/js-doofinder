(function() {
  var Client, Session, Stats, uniqueId;

  uniqueId = require("./util/uniqueid");

  Client = require("./client");

  Session = (require("./session")).Session;

  Stats = (function() {
    function Stats(client, session) {
      this.client = client;
      this.session = session;
      if (!(this.client instanceof Client)) {
        throw this.error("Invalid Client");
      }
      if (!(this.session instanceof Session)) {
        throw this.error("Invalid Session");
      }
    }

    Stats.prototype.error = function(message) {
      return new Error(this.constructor.name + ": " + message);
    };


    /**
     * Registers the session in Doofinder stats if not already registered.
     * It marks the session as registered synchronously to short-circuit other
     * attempts while the request is in progress. If an error occurs in the
     * stats request the session is marked as unregistered again.
     *
     * WARNING: This should be called ONLY if the user has performed a search.
     *          That's why this is usually called when the user has stopped
     *          typing in the search box.
     *
     *
     * @param  {Function} callback Optional callback to be called when the
     *                             response is received. First param is the
     *                             error, if any, and the second one is the
     *                             response, if any.
     * @return {Boolean}           Whether the stats request has been done or
     *                             not (doesn't check if it was successful).
     * @public
     */

    Stats.prototype.registerSession = function(callback) {
      var alreadyRegistered;
      alreadyRegistered = this.session.get("registered", false);
      if (!alreadyRegistered) {
        this.session.set("registered", true);
        this.client.stats("init", {
          session_id: this.session.get("session_id")
        }, (function(_this) {
          return function(err, res) {
            if (err != null) {
              _this.session.set("registered", false);
            }
            if (callback != null) {
              return callback(err, res);
            }
          };
        })(this));
      }
      return !alreadyRegistered;
    };


    /**
     * Registers a search for the session.
     *
     * WARNING: This should be called ONLY if the user has performed a search.
     *          That's why this is usually called when the user has stopped
     *          typing in the search box.
     *
     * @public
     * @param  {String} query Search terms.
     */

    Stats.prototype.registerSearch = function(query) {
      return this.session.set("query", query);
    };


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

    Stats.prototype.registerClick = function(dfid, query, callback) {
      var params;
      dfid = uniqueId.clean.dfid("" + dfid);
      this.session.set("dfid", dfid);
      if (query != null) {
        this.session.set("query", query);
      }
      params = {
        dfid: dfid,
        session_id: this.session.get("session_id"),
        query: this.session.get("query")
      };
      return this.client.stats("click", params, function(err, res) {
        if (callback != null) {
          return callback(err, res);
        }
      });
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

    Stats.prototype.registerCheckout = function(callback) {
      var sessionExists;
      sessionExists = this.session.exists();
      if (sessionExists) {
        this.client.stats("checkout", {
          session_id: this.session.get("session_id")
        }, (function(_this) {
          return function(err, res) {
            if (err == null) {
              _this.session.clean();
            }
            if (callback != null) {
              return callback(err, res);
            }
          };
        })(this));
      }
      return sessionExists;
    };


    /**
     * Registers an event for a banner
     * @param  {String}   eventName Name of the event.
     *                              - display
     *                              - click
     * @param  {*}        bannerId  Id of the banner.
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
      }, function(err, res) {
        if (callback != null) {
          return callback(err, res);
        }
      });
    };

    return Stats;

  })();

  module.exports = Stats;

}).call(this);
