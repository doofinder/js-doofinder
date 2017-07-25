(function() {
  var CookieSessionStore, Cookies, ISessionStore, ObjectSessionStore, Session, extend, md5, uniqueId,
    extend1 = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Cookies = require("js-cookie");

  extend = require("extend");

  md5 = require("md5");

  uniqueId = require("./util/uniqueid");

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

    ISessionStore.prototype.clean = function() {
      throw Error("ISessionStore.clean not implemented!");
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

    ObjectSessionStore.prototype.__getData = function() {
      if (this.data.session_id == null) {
        this.data.session_id = uniqueId.generate.hash();
      }
      return this.data;
    };

    ObjectSessionStore.prototype.__setData = function(data) {
      this.data = data;
    };

    ObjectSessionStore.prototype.clean = function() {
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

    CookieSessionStore.prototype.__getData = function() {
      var dataObj;
      dataObj = Cookies.getJSON(this.cookieName);
      if (dataObj == null) {
        dataObj = this.__setData({
          session_id: uniqueId.generate.browserHash()
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

    CookieSessionStore.prototype.clean = function() {
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
     * @param  {ISessionStore} store  Holds session data.
     */
    function Session(store) {
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

    Session.prototype.clean = function() {
      return this.store.clean();
    };


    /**
     * Checks whether the search session exists or not.
     * @return {Boolean} `true` if the session exists, `false` otherwise.
     */

    Session.prototype.exists = function() {
      return this.store.exists();
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
