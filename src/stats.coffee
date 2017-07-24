uniqueId = require "./util/uniqueid"

class Stats
  constructor: (@client, @session) ->

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
    @session.set "query", query
    @registerSession() unless (@session.get "registered", false)

  ###*
   * Registers the session in Doofinder stats and marks the session as
   * registered.
   * @public
  ###
  registerSession: ->
    @client.stats "init", session_id: (@session.get "session_id")
    @session.set "registered", true

  ###*
   * Registers a click on a search result for the specified search query.
   * @public
   * @param  {String} dfid  Doofinder's internal ID for the result.
   * @param  {String} query Search terms.
  ###
  registerClick: (dfid, query) ->
    dfid = uniqueId.clean.dfid "#{dfid}"

    @session.set "dfid", dfid
    (@session.set "query", query) if query?

    params =
      dfid: dfid
      session_id: @session.get "session_id"
      query: @session.get "query"

    @client.stats "click", params

  ###*
   * Register a checkout when the location passed matches one of the URLs
   * provided.
   *
   * @public
  ###
  registerCheckout: ->
    @client.stats "checkout", session_id: (@session.get "session_id")
    @session.clean()

  ###*
   * Method to register banner events
   * @public
   *
   * @param {String} bannerId
  ###
  registerBannerEvent: (eventName, bannerId) ->
    @client.stats "banner_#{eventName}", banner_id: bannerId


module.exports = Stats
