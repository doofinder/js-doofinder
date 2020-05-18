Cookies = require "js-cookie"
md5 = require "md5"

errors = require "./util/errors"
merge = require "./util/merge"
uniqueId = require "./util/uniqueid"


###*
 * Interface that all storage classes must implement. See Session class.
###
class ISessionStore
  ###*
   * Gets the value for the specified key from the storage.
   * @public
   * @param  {String} key
   * @param  {*}      defaultValue Value to return if the key does not exist.
   * @return {*}
  ###
  get: (key, defaultValue) ->
    dataObj = @__getData()
    unless dataObj.session_id?
      throw (errors.error "__getData must ensure session_id exists!", @)
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
    throw (errors.error "__getData() not implemented!", @)

  ###*
   * Sets the current data object.
   * @protected
   * @param  {Object} dataObj New data.
   * @return {Object}         New data.
  ###
  __setData: (dataObj) ->
    throw (errors.error "__setData(dataObj) not implemented!", @)

  ###*
   * Deletes the current data, including session_id.
   * @public
   * @return {*}
  ###
  clean: ->
    throw (errors.error "clean() not implemented!", @)

  ###*
   * Checks whether the session exists or not.
   * @return {Boolean} `true` if the session exists, `false` otherwise.
  ###
  exists: ->
    throw (errors.error "exists() not implemented!", @)


###*
 * Holds session data in a plain object.
###
class ObjectSessionStore extends ISessionStore
  ###*
   * @param  {Object} data Session data.
  ###
  constructor: (@data = {}) ->

  __getData: ->
    # ensure session id exists
    @data.session_id ?= uniqueId.generate.hash()
    @data

  __setData: (@data) ->

  clean: ->
    @data = {}

  exists: ->
    @data.session_id?

  registered: (value) ->
    unless value?
      @data.registered?
    else if value is true
      @data.registered = new Date().getTime()
    else
      delete @data.registered

  expired: -> false


class LocalStorageSessionStore extends ISessionStore
  constructor: (hashid, ttl = 24) ->
    @bucket = "#{hashid}.session"
    @ttl = ttl

    if @expired()
      @clean()

  __getJSON: ->
    data = window.localStorage.getItem @bucket
    JSON.parse data if data?

  __getData: ->
    dataObj = @__getJSON()
    unless dataObj?
      # ensure session id
      dataObj = @__setData session_id: uniqueId.generate.browserHash()
    dataObj

  __setData: (dataObj) ->
    window.localStorage.setItem @bucket, (JSON.stringify dataObj)
    dataObj

  clean: ->
    window.localStorage.removeItem @bucket

  exists: ->
    (@__getJSON() or {}).session_id?

  registered: (value) ->
    unless value?
      (@__getJSON() or {}).registered?
    else if value is true
      @set 'registered', new Date().getTime()
    else
      @del 'registered'

  expired: ->
    if not @registered()
      false
    else
      new Date().getTime() - @registered() > @ttl * 60 * 60 * 1000

###*
 * Holds session data in a browser cookie.
###
class CookieSessionStore extends ISessionStore
  ###*
   * @param  {String} cookieName Name for the cookie.
   * @param  {Object} options    Options object.
   *                             - prefix: String to be appended to the cookie
   *                                 name.
   *                             - expiry: In days, 1 hour by default
  ###
  constructor: (cookieName, options = {}) ->
    defaults =
      prefix: ""
      expiry: 1
    options = merge defaults, (options or {})
    @cookieName = "#{options.prefix}#{cookieName}"
    @expiry = options.expiry

  __getJSON: ->
    Cookies.getJSON @cookieName

  __getData: ->
    dataObj = @__getJSON()
    unless dataObj?
      # ensure session id
      dataObj = @__setData session_id: uniqueId.generate.browserHash()
    dataObj

  __setData: (dataObj) ->
    Cookies.set @cookieName, dataObj, expires: @expiry
    return dataObj

  clean: ->
    Cookies.remove @cookieName

  exists: ->
    (@__getJSON() or {}).session_id?

  registered: (value) ->
    unless value?
      (@__getJSON() or {}).registered?
    else if value is true
      @set 'registered', new Date().getTime()
    else
      @del 'registered'

  expired: -> false


###*
 * Class representing a User session persisted somewhere.
###
class Session
  ###*
   * @param  {ISessionStore} store  Holds session data.
  ###
  constructor: (@store = new ObjectSessionStore()) ->

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

  ###*
   * Deletes the specified key from the session store.
   * @param  {String} key
   * @return {Object} The current value of the data object.
  ###
  del: (key) ->
    @store.del key

  ###*
   * Finishes the session by removing the stored data.
  ###
  clean: ->
    @store.clean()

  ###*
   * Checks whether the search session exists or not.
   * @return {Boolean} `true` if the session exists, `false` otherwise.
  ###
  exists: ->
    @store.exists()

  registered: (value) ->
    @store.registered value

  expired: ->
    @store.expired()


module.exports =
  Session: Session
  ISessionStore: ISessionStore
  ObjectSessionStore: ObjectSessionStore
  CookieSessionStore: CookieSessionStore
  LocalStorageSessionStore: LocalStorageSessionStore
