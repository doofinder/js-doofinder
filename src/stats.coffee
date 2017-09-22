uniqueId = require "./util/uniqueid"

Client = require "./client"
Session = (require "./session").Session

class Stats
  constructor: (@client, @session) ->
    unless @client instanceof Client
      throw @error "Invalid Client"
    unless @session instanceof Session
      throw @error "Invalid Session"

  error: (message) ->
    new Error "#{@constructor.name}: #{message}"

  ###*
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
  ###
  registerSession: (callback) ->
    alreadyRegistered = @session.get "registered", false
    unless alreadyRegistered
      @session.set "registered", true  # sync, short-circuit other attempts
      @client.stats "init", session_id: (@session.get "session_id"), (err, res) ->
        (@session.set "registered", false) if err? # revert on error
        (callback err, res) if callback?
    not alreadyRegistered

  ###*
   * Registers a search for the session.
   *
   * WARNING: This should be called ONLY if the user has performed a search.
   *          That's why this is usually called when the user has stopped
   *          typing in the search box.
   *
   * @public
   * @param  {String} query Search terms.
  ###
  registerSearch: (query) ->
    @session.set "query", query

  ###*
   * Registers a click on a search result for the specified search query.
   *
   * @param  {String}   dfid      Doofinder's internal ID for the result.
   * @param  {String}   query     Search terms.
   * @param  {Function} callback  Optional callback to be called when the
   *                              response is received. First param is the
   *                              error, if any, and the second one is the
   *                              response, if any.
   * @public
  ###
  registerClick: (dfid, query, callback) ->
    dfid = uniqueId.clean.dfid "#{dfid}"

    @session.set "dfid", dfid
    (@session.set "query", query) if query?

    params =
      dfid: dfid
      session_id: @session.get "session_id"
      query: @session.get "query"

    @client.stats "click", params, (err, res) ->
      (callback err, res) if callback?

  ###*
   * Registers a checkout if session exists.
   * @param  {Function} callback Optional callback to be called when the
   *                             response is received. First param is the
   *                             error, if any, and the second one is the
   *                             response, if any.
   * @return {Boolean}           true if session exists and the request is
   *                             made (doesn't check request success).
   * @public
  ###
  registerCheckout: (callback) ->
    sessionExists = @session.exists()
    if sessionExists
      @client.stats "checkout", session_id: (@session.get "session_id"), (err, res) =>
        unless err?
          @session.clean()
        (callback err, res) if callback?
    sessionExists

  ###*
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
  ###
  registerBannerEvent: (eventName, bannerId, callback) ->
    unless eventName?
      throw @error "eventName is required"
    unless bannerId?
      throw @error "bannerId is required"
    @client.stats "banner_#{eventName}", banner_id: "#{bannerId}", (err, res) ->
      (callback err, res) if callback?


module.exports = Stats
