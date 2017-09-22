Cookies = require "js-cookie"
extend = require "extend"
md5 = require "md5"

uniqueId = require "./util/uniqueid"


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
  clean: ->
    throw Error "ISessionStore.clean not implemented!"

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

  __getData: ->
    @data.session_id = uniqueId.generate.hash() unless @data.session_id?
    @data

  __setData: (@data) ->

  clean: ->
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

  __getData: ->
    dataObj = Cookies.getJSON @cookieName
    unless dataObj?
      dataObj = @__setData session_id: uniqueId.generate.browserHash()
    dataObj

  __setData: (dataObj) ->
    Cookies.set @cookieName, dataObj, expires: @expiry
    return dataObj

  clean: ->
    Cookies.remove @cookieName

  exists: ->
    ((Cookies.getJSON @cookieName) or {}).session_id?


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

  del: (key) ->
    @store.del key

  ###*
   * Finishes the session by removing the cookie.
  ###
  clean: ->
    @store.clean()

  ###*
   * Checks whether the search session exists or not.
   * @return {Boolean} `true` if the session exists, `false` otherwise.
  ###
  exists: ->
    @store.exists()


module.exports =
  Session: Session
  ISessionStore: ISessionStore
  CookieSessionStore: CookieSessionStore
  ObjectSessionStore: ObjectSessionStore
