(function() {
  var Stats, uniqueId;

  uniqueId = require("./util/uniqueid");

  Stats = (function() {
    function Stats(client, session) {
      this.client = client;
      this.session = session;
    }


    /**
     * Registers a search for the session.
     * Registers the session in Doofinder stats if not already registered.
     *
     * WARNING: This must be called ONLY if the user has performed a search.
     *          That's why this is usually called when the user has stopped
     *          typing in the search box.
     *
     * @public
     * @param  {String} query Search terms.
     */

    Stats.prototype.registerSearch = function(query) {
      this.session.set("query", query);
      if (!(this.session.get("registered", false))) {
        return this.registerSession();
      }
    };


    /**
     * Registers the session in Doofinder stats and marks the session as
     * registered.
     * @public
     */

    Stats.prototype.registerSession = function() {
      this.client.stats("init", {
        session_id: this.session.get("session_id")
      });
      return this.session.set("registered", true);
    };


    /**
     * Registers a click on a search result for the specified search query.
     * @public
     * @param  {String} dfid  Doofinder's internal ID for the result.
     * @param  {String} query Search terms.
     */

    Stats.prototype.registerClick = function(dfid, query) {
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
      return this.client.stats("click", params);
    };


    /**
     * Register a checkout when the location passed matches one of the URLs
     * provided.
     *
     * @public
     */

    Stats.prototype.registerCheckout = function() {
      this.client.stats("checkout", {
        session_id: this.session.get("session_id")
      });
      return this.session.clean();
    };


    /**
     * Method to register banner events
     * @public
     *
     * @param {String} bannerId
     */

    Stats.prototype.registerBannerEvent = function(eventName, bannerId) {
      return this.client.stats("banner_" + eventName, {
        banner_id: bannerId
      });
    };

    return Stats;

  })();

  module.exports = Stats;

}).call(this);
