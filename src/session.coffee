Cookies = require "js-cookie"
extend = require "extend"
md5 = require "md5"


class ISessionStore
  ###*
   * Gets the value for the specified key.
   * @public
   * @param  {String} key
   * @param  {*}      defaultValue Value to return if the key does not exist.
   * @return {*}
  ###
  get: (key, defaultValue) ->
    dataObj = @__getData()
    unless dataObj.session_id?
      throw Error "ISessionStore.__getData must ensure session_id exists!"
    dataObj[key] or defaultValue

  ###*
   * Sets the value for the specified key.
   * @public
   * @param  {String} key
   * @param  {*}      value
   * @return {Object}       Current data.
  ###
  set: (key, value) ->
    dataObj = @__getData()
    dataObj[key] = value
    @__setData dataObj

  ###*
   * Deletes the specified key
   * @param  {String} key
   * @return {Object}     Current data.
  ###
  del: (key) ->
    dataObj = @__getData()
    delete dataObj[key]
    @__setData dataObj

  ###*
   * Returns the current data object and ensures that it contains a session_id
   * key.
   *
   * @protected
   * @return {Object} Current data.
  ###
  __getData: ->
    throw Error "ISessionStore.__getData not implemented!"

  ###*
   * Sets the current data object.
   * @protected
   * @param  {Object} dataObj New data.
   * @return {Object}         New data.
  ###
  __setData: (dataObj) ->
    throw Error "ISessionStore.__setData(dataObj) not implemented!"

  ###*
   * Deletes the current data, including session_id.
   * @public
   * @return {*}
  ###
  delete: ->
    throw Error "ISessionStore.delete not implemented!"

  ###*
   * Checks whether the session exists or not.
   * @return {Boolean} `true` if the session exists, `false` otherwise.
  ###
  exists: ->
    throw Error "ISessionStore.exists not implemented!"


###*
 * Holds session data in a plain object.
###
class ObjectSessionStore extends ISessionStore
  ###*
   * @param  {Object} data Session data.
  ###
  constructor: (@data = {}) ->

  ###*
  * Generates a unique session ID based on some randomness.
  * @protected
  * @return {String} A MD5 hash.
  ###
  __uniqueId: ->
    md5 [
      new Date().getTime(),
      String(Math.floor(Math.random() * 10000))
    ].join ""

  __getData: ->
    @data.session_id = @__uniqueId() unless @data.session_id?
    @data

  __setData: (@data) ->

  delete: ->
    @data = {}

  exists: ->
    @data.session_id?


class CookieSessionStore extends ISessionStore
  constructor: (cookieName, options = {}) ->
    defaults =
      prefix: ""
      expiry: 1 / 24
    options = extend true, defaults, (options or {})
    @cookieName = "#{options.prefix}#{cookieName}"
    @expiry = options.expiry

  ###*
   * Generates a unique session ID based on the user's browser, the location and
   * some randomness.
   *
   * @protected
   * @return {[type]} [description]
  ###
  __uniqueId: ->
    md5 [
      navigator.userAgent,
      navigator.language,
      window.location.host,
      new Date().getTime(),
      String(Math.floor(Math.random() * 10000))
    ].join ""

  __getData: ->
    dataObj = Cookies.getJSON @cookieName
    unless dataObj?
      dataObj = @__setData session_id: @__uniqueId()
    dataObj

  __setData: (dataObj) ->
    Cookies.set @cookieName, dataObj, expires: @expiry
    return dataObj

  delete: ->
    Cookies.remove @cookieName

  exists: ->
    ((Cookies.getJSON @cookieName) or {}).session_id?


###*
 * Class representing a User session persisted somewhere.
###
class Session
  ###*
   * Creates a Session.
   * @param  {Client}     client
   * @param  {*}          store      A store object which implements:
   *                                   - get(key, default)
   *                                   - set(key, value)
   *                                   - del(key)
   *                                   - delete()
   *                                   - exists()
  ###
  constructor: (@client, @store = new ObjectSessionStore()) ->

  ###*
   * Gets the value for the specified key.
   * @public
   * @param  {String} key
   * @param  {*}      defaultValue, value to return if the key does not exist.
   * @return {*}
  ###
  get: (key, defaultValue) ->
    @store.get key, defaultValue

  ###*
   * Sets the value for the specified key.
   * @public
   * @param {String} key
   * @param {*}             value
   * @return {Object} The current value of the data object.
  ###
  set: (key, value) ->
    @store.set key, value

  del: (key) ->
    @store.del key

  ###*
   * Finishes the session by removing the cookie.
  ###
  delete: ->
    @store.delete()

  ###*
   * Checks whether the search session exists or not.
   * @return {Boolean} `true` if the session exists, `false` otherwise.
  ###
  exists: ->
    @store.exists()

  ###*
   * Registers a search for the session.
   * Registers the session in Doofinder stats if not already registered.
   *
   * WARNING: This must be called ONLY if the user has performed a search.
   *          That's why this is usually called when the user has stopped
   *          typing in the search box.
   *
   * @public
   * @param  {String} query Search terms.
  ###
  registerSearch: (query) ->
    @set "query", query
    unless @get "registered", false
      @client.registerSession @get "session_id"
      @set "registered", true

  ###*
   * Registers a click on a search result for the specified search query.
   * @public
   * @param  {String} dfid  Doofinder's internal ID for the result.
   * @param  {String} query Search terms.
  ###
  registerClick: (dfid, query) ->
    @set "dfid", dfid
    if query?
      @set "query", query  # not sure this is needed
    @client.registerClick dfid, 
      sessionId: @get "session_id"
      query: @get "query"

  ###*
   * Register a checkout when the location passed matches one of the URLs
   * provided.
   *
   * @public
  ###
  registerCheckout: () ->
    sessionId = @get "session_id"
    @client.registerCheckout sessionId
    @delete()


module.exports =
  Session: Session
  ISessionStore: ISessionStore
  CookieSessionStore: CookieSessionStore
  ObjectSessionStore: ObjectSessionStore
