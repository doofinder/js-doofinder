errors = require "./util/errors"
uniqueId = require "./util/uniqueid"

Client = require "./client"
Session = (require "./session").Session

###*
 * Helper class to wrap calls to the Doofinder stats API endpoint.
###
class Stats
  ###*
   * Stats client constructor.
   * @param  {Client}   @client  Doofinder's Client instance
   * @param  {Session}  @session Session instance
  ###
  constructor: (@client, @session) ->
    unless @client instanceof Client
      throw errors.error "First parameter must be a Client object!", @
    unless @session instanceof Session
      throw errors.error "Second parameter must be a Session object!", @

  ###*
   * Sets current search terms in the search session.
   *
   * WARNING: This should be called ONLY if the user has performed a search.
   *          That's why this is usually called when the user has stopped
   *          typing in the search box.
   *
   * @public
   * @param  {String} query Search terms.
  ###
  setCurrentQuery: (query) ->
    @session.set "query", query

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
      @client.stats "init", session_id: (@session.get "session_id"), (err, res) =>
        (@session.set "registered", false) if err? # revert on error
        callback? err, res
    not alreadyRegistered

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

    @client.stats "click", params, (err, res) =>
      callback? err, res

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
        callback? err, res
    sessionExists

  ###*
   * Registers an event for a banner
   * @param  {String}   eventName Name of the event.
   *                              - display
   *                              - click
   * @param  {Number}   bannerId  Id of the banner.
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
    @client.stats "banner_#{eventName}", banner_id: "#{bannerId}", (err, res) =>
      callback? err, res


module.exports = Stats
