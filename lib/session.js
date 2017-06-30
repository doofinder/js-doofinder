(function() {
  var CookieSessionStore, Cookies, ISessionStore, ObjectSessionStore, Session, extend, md5,
    extend1 = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Cookies = require("js-cookie");

  extend = require("extend");

  md5 = require("md5");

  ISessionStore = (function() {
    function ISessionStore() {}


    /**
     * Gets the value for the specified key.
     * @public
     * @param  {String} key
     * @param  {*}      defaultValue Value to return if the key does not exist.
     * @return {*}
     */

    ISessionStore.prototype.get = function(key, defaultValue) {
      var dataObj;
      dataObj = this.__getData();
      if (dataObj.session_id == null) {
        throw Error("ISessionStore.__getData must ensure session_id exists!");
      }
      return dataObj[key] || defaultValue;
    };


    /**
     * Sets the value for the specified key.
     * @public
     * @param  {String} key
     * @param  {*}      value
     * @return {Object}       Current data.
     */

    ISessionStore.prototype.set = function(key, value) {
      var dataObj;
      dataObj = this.__getData();
      dataObj[key] = value;
      return this.__setData(dataObj);
    };


    /**
     * Deletes the specified key
     * @param  {String} key
     * @return {Object}     Current data.
     */

    ISessionStore.prototype.del = function(key) {
      var dataObj;
      dataObj = this.__getData();
      delete dataObj[key];
      return this.__setData(dataObj);
    };


    /**
     * Returns the current data object and ensures that it contains a session_id
     * key.
     *
     * @protected
     * @return {Object} Current data.
     */

    ISessionStore.prototype.__getData = function() {
      throw Error("ISessionStore.__getData not implemented!");
    };


    /**
     * Sets the current data object.
     * @protected
     * @param  {Object} dataObj New data.
     * @return {Object}         New data.
     */

    ISessionStore.prototype.__setData = function(dataObj) {
      throw Error("ISessionStore.__setData(dataObj) not implemented!");
    };


    /**
     * Deletes the current data, including session_id.
     * @public
     * @return {*}
     */

    ISessionStore.prototype["delete"] = function() {
      throw Error("ISessionStore.delete not implemented!");
    };


    /**
     * Checks whether the session exists or not.
     * @return {Boolean} `true` if the session exists, `false` otherwise.
     */

    ISessionStore.prototype.exists = function() {
      throw Error("ISessionStore.exists not implemented!");
    };

    return ISessionStore;

  })();


  /**
   * Holds session data in a plain object.
   */

  ObjectSessionStore = (function(superClass) {
    extend1(ObjectSessionStore, superClass);


    /**
     * @param  {Object} data Session data.
     */

    function ObjectSessionStore(data) {
      this.data = data != null ? data : {};
    }


    /**
    * Generates a unique session ID based on some randomness.
    * @protected
    * @return {String} A MD5 hash.
     */

    ObjectSessionStore.prototype.__uniqueId = function() {
      return md5([new Date().getTime(), String(Math.floor(Math.random() * 10000))].join(""));
    };

    ObjectSessionStore.prototype.__getData = function() {
      if (this.data.session_id == null) {
        this.data.session_id = this.__uniqueId();
      }
      return this.data;
    };

    ObjectSessionStore.prototype.__setData = function(data) {
      this.data = data;
    };

    ObjectSessionStore.prototype["delete"] = function() {
      return this.data = {};
    };

    ObjectSessionStore.prototype.exists = function() {
      return this.data.session_id != null;
    };

    return ObjectSessionStore;

  })(ISessionStore);

  CookieSessionStore = (function(superClass) {
    extend1(CookieSessionStore, superClass);

    function CookieSessionStore(cookieName, options) {
      var defaults;
      if (options == null) {
        options = {};
      }
      defaults = {
        prefix: "",
        expiry: 1 / 24
      };
      options = extend(true, defaults, options || {});
      this.cookieName = "" + options.prefix + cookieName;
      this.expiry = options.expiry;
    }


    /**
     * Generates a unique session ID based on the user's browser, the location and
     * some randomness.
     *
     * @protected
     * @return {[type]} [description]
     */

    CookieSessionStore.prototype.__uniqueId = function() {
      return md5([navigator.userAgent, navigator.language, window.location.host, new Date().getTime(), String(Math.floor(Math.random() * 10000))].join(""));
    };

    CookieSessionStore.prototype.__getData = function() {
      var dataObj;
      dataObj = Cookies.getJSON(this.cookieName);
      if (dataObj == null) {
        dataObj = this.__setData({
          session_id: this.__uniqueId()
        });
      }
      return dataObj;
    };

    CookieSessionStore.prototype.__setData = function(dataObj) {
      Cookies.set(this.cookieName, dataObj, {
        expires: this.expiry
      });
      return dataObj;
    };

    CookieSessionStore.prototype["delete"] = function() {
      return Cookies.remove(this.cookieName);
    };

    CookieSessionStore.prototype.exists = function() {
      return ((Cookies.getJSON(this.cookieName)) || {}).session_id != null;
    };

    return CookieSessionStore;

  })(ISessionStore);


  /**
   * Class representing a User session persisted somewhere.
   */

  Session = (function() {

    /**
     * Creates a Session.
     * @param  {Controller} controller
     * @param  {*}          store      A store object which implements:
     *                                   - get(key, default)
     *                                   - set(key, value)
     *                                   - del(key)
     *                                   - delete()
     *                                   - exists()
     */
    function Session(controller, store) {
      this.controller = controller;
      this.store = store != null ? store : new ObjectSessionStore();
    }


    /**
     * Gets the value for the specified key.
     * @public
     * @param  {String} key
     * @param  {*}      defaultValue, value to return if the key does not exist.
     * @return {*}
     */

    Session.prototype.get = function(key, defaultValue) {
      return this.store.get(key, defaultValue);
    };


    /**
     * Sets the value for the specified key.
     * @public
     * @param {String} key
     * @param {*}             value
     * @return {Object} The current value of the data object.
     */

    Session.prototype.set = function(key, value) {
      return this.store.set(key, value);
    };

    Session.prototype.del = function(key) {
      return this.store.del(key);
    };


    /**
     * Finishes the session by removing the cookie.
     */

    Session.prototype["delete"] = function() {
      return this.store["delete"]();
    };


    /**
     * Checks whether the search session exists or not.
     * @return {Boolean} `true` if the session exists, `false` otherwise.
     */

    Session.prototype.exists = function() {
      return this.store.exists();
    };


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
     * @param  {String} dfid  Doofinder's internal ID for the result.
     * @param  {String} query Search terms.
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
     * @param {String} location The URL to check against the patterns.
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

    return Session;

  })();

  module.exports = {
    Session: Session,
    ISessionStore: ISessionStore,
    CookieSessionStore: CookieSessionStore,
    ObjectSessionStore: ObjectSessionStore
  };

}).call(this);
