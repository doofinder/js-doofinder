Cookies = require "js-cookie"
extend = require "extend"
md5 = require "md5"

###*
 * Class representing a User session persisted to a Cookie.
###
class Session
  ###*
   * Creates a Session.
   * @param  {Controller} controller
   * @param  {Object}     options     prefix: A prefix for the cookie.
   *                                  expiry: Duration in days. Default: 1h.
  ###
  constructor: (@controller, options = {}) ->
    defaults =
      prefix: "doofhit"
      expiry: 1 / 24
    options = extend true, defaults, (options or {})

    @cookieName = "#{options.prefix}#{@controller.hashid}"
    @expiry = options.expiry

  ###*
   * Registers a search in the search session.
   * Registers the session in Doofinder stats if not already registered.
   *
   * WARNING: This must be called ONLY if the user has performed a search.
   *          That's why this is usually called when the user has stopped
   *          typing in the search box.
   *
   * @public
   * @param  {string} query Search terms.
  ###
  registerSearch: (query) ->
    @set "query", query
    unless @get "registered", false
      @controller.registerSession @get "session_id"
      @set "registered", true

  ###*
   * Registers a click on a search result for the specified search query.
   * @public
   * @param  {string} dfid  Doofinder's internal ID for the result.
   * @param  {string} query Search terms.
  ###
  registerClick: (dfid, query) ->
    @set "dfid", dfid
    @set "query", query  # not sure this is needed
    @controller.registerClick dfid, sessionId: @get "session_id"

  ###*
   * Register a checkout when the location passed matches one of the URLs
   * provided.
   *
   * @public
   * @param {string} location The URL to check against the patterns.
   * @param {Array}  patterns A list of regular expressions to test with the
   *                          provided location.
  ###
  registerCheckout: (location, patterns = []) ->
    sessionId = @get "session_id"
    for pattern in patterns
      try
        if pattern.test location
          @client.registerCheckout sessionId
          @delete()

          return true
      catch e
        console.error e.message

    return false

  ###*
   * Gets all the stored session data as an Object.
   * Creates a new session cookie if it does not exist.
   *
   * @protected
   * @return {Object}
  ###
  __getData: ->
    cookieObj = Cookies.getJSON @cookieName
    unless cookieObj?
      cookieObj = @__setData session_id: this.__uniqueId()
    cookieObj

  ###*
   * Sets an object as session data.
   *
   * @protected
   * @return {Object}
  ###
  __setData: (cookieObj) ->
    Cookies.set @cookieName, cookieObj, expires: @expiry
    return cookieObj

  ###*
   * Gets the value for the specified key.
   * @public
   * @param  {string} key
   * @param  {*}      defaultValue, value to return if the key does not exist.
   * @return {*}
  ###
  get: (key, defaultValue) ->
    cookieObj = @__getData()
    cookieObj[key] or defaultValue

  ###*
   * Sets the value for the specified key.
   * @public
   * @param {string|number} key
   * @param {*}             value
   * @return {Object} The current value of the cookie object.
  ###
  set: (key, value) ->
    cookieObj = @__getData()
    cookieObj[key] = value
    @__setData cookieObj

  ###*
   * Finishes the session by removing the cookie.
  ###
  delete: ->
    Cookies.remove @cookieName

  ###*
   * Checks whether the search session cookie exists or not.
   * @return {Boolean} `true` if the cookie exists, `false` otherwise.
  ###
  exists: ->
    if (Cookies.getJSON @cookieName)? then true else false

  ###*
  * Generate a unique ID based on the user browser, the current host name and
  * some randomness.
  * @return {string} A MD5 hash.
  ###
  __uniqueId: ->
    md5 [
      navigator.userAgent,
      navigator.language,
      window.location.host,
      new Date().getTime(),
      String(Math.floor(Math.random() * 10000))
    ].join ""

module.exports = Session