(function() {
  var Cookies, Session, extend, md5;

  Cookies = require("js-cookie");

  extend = require("extend");

  md5 = require("md5");


  /**
   * Class representing a User session persisted to a Cookie.
   */

  Session = (function() {

    /**
     * Creates a Session.
     * @param  {Controller} controller
     * @param  {Object}     options     prefix: A prefix for the cookie.
     *                                  expiry: Duration in days. Default: 1h.
     */
    function Session(controller, options) {
      var defaults;
      this.controller = controller;
      if (options == null) {
        options = {};
      }
      defaults = {
        prefix: "doofhit",
        expiry: 1 / 24
      };
      options = extend(true, defaults, options || {});
      this.cookieName = "" + options.prefix + this.controller.hashid;
      this.expiry = options.expiry;
    }


    /**
     * Registers a search in the search session.
     * Registers the session in Doofinder stats if not already registered.
     *
     * WARNING: This must be called ONLY if the user has performed a search.
     *          That's why this is usually called when the user has stopped
     *          typing in the search box.
     *
     * @public
     * @param  {string} query Search terms.
     */

    Session.prototype.registerSearch = function(query) {
      this.set("query", query);
      if (!this.get("registered", false)) {
        this.controller.registerSession(this.get("session_id"));
        return this.set("registered", true);
      }
    };


    /**
     * Registers a click on a search result for the specified search query.
     * @public
     * @param  {string} dfid  Doofinder's internal ID for the result.
     * @param  {string} query Search terms.
     */

    Session.prototype.registerClick = function(dfid, query) {
      this.set("dfid", dfid);
      this.set("query", query);
      return this.controller.registerClick(dfid, {
        sessionId: this.get("session_id")
      });
    };


    /**
     * Register a checkout when the location passed matches one of the URLs
     * provided.
     *
     * @public
     * @param {string} location The URL to check against the patterns.
     * @param {Array}  patterns A list of regular expressions to test with the
     *                          provided location.
     */

    Session.prototype.registerCheckout = function(location, patterns) {
      var e, i, len, pattern, sessionId;
      if (patterns == null) {
        patterns = [];
      }
      sessionId = this.get("session_id");
      for (i = 0, len = patterns.length; i < len; i++) {
        pattern = patterns[i];
        try {
          if (pattern.test(location)) {
            this.controller.registerCheckout(sessionId);
            this["delete"]();
            return true;
          }
        } catch (_error) {
          e = _error;
          console.error(e.message);
        }
      }
      return false;
    };


    /**
     * Gets all the stored session data as an Object.
     * Creates a new session cookie if it does not exist.
     *
     * @protected
     * @return {Object}
     */

    Session.prototype.__getData = function() {
      var cookieObj;
      cookieObj = Cookies.getJSON(this.cookieName);
      if (cookieObj == null) {
        cookieObj = this.__setData({
          session_id: this.__uniqueId()
        });
      }
      return cookieObj;
    };


    /**
     * Sets an object as session data.
     *
     * @protected
     * @return {Object}
     */

    Session.prototype.__setData = function(cookieObj) {
      Cookies.set(this.cookieName, cookieObj, {
        expires: this.expiry
      });
      return cookieObj;
    };


    /**
     * Gets the value for the specified key.
     * @public
     * @param  {string} key
     * @param  {*}      defaultValue, value to return if the key does not exist.
     * @return {*}
     */

    Session.prototype.get = function(key, defaultValue) {
      var cookieObj;
      cookieObj = this.__getData();
      return cookieObj[key] || defaultValue;
    };


    /**
     * Sets the value for the specified key.
     * @public
     * @param {string|number} key
     * @param {*}             value
     * @return {Object} The current value of the cookie object.
     */

    Session.prototype.set = function(key, value) {
      var cookieObj;
      cookieObj = this.__getData();
      cookieObj[key] = value;
      return this.__setData(cookieObj);
    };


    /**
     * Finishes the session by removing the cookie.
     */

    Session.prototype["delete"] = function() {
      return Cookies.remove(this.cookieName);
    };


    /**
     * Checks whether the search session cookie exists or not.
     * @return {Boolean} `true` if the cookie exists, `false` otherwise.
     */

    Session.prototype.exists = function() {
      if ((Cookies.getJSON(this.cookieName)) != null) {
        return true;
      } else {
        return false;
      }
    };


    /**
    * Generate a unique ID based on the user browser, the current host name and
    * some randomness.
    * @return {string} A MD5 hash.
     */

    Session.prototype.__uniqueId = function() {
      return md5([navigator.userAgent, navigator.language, window.location.host, new Date().getTime(), String(Math.floor(Math.random() * 10000))].join(""));
    };

    return Session;

  })();

  module.exports = Session;

}).call(this);
