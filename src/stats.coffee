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
  constructor: (@client) ->
    unless @client instanceof Client
      throw errors.error "First parameter must be a Client object!", @

  ###*
   * Wrapper of @client.stats function.
   *
   * WARNING: This should be called ONLY if the user has performed a search.
   *          That's why this is usually called when the user has stopped
   *          typing in the search box.
   *
   * @param  {String}  	session_id  Session id.
   *
   * @param  {Function} callback    Optional callback to be called when the
   *                                response is received. First param is the
   *                                error, if any, and the second one is the
   *                                response, if any.
   * @public
  ###
  registerSession: (session_id, callback) ->
    @client.stats "init", (session_id: session_id), callback

  ###*
   * Registers a click on a search result for the specified search query.
   *
   * @param  {String}  	session_id  Session id.
   * @param  {String}   dfid        Doofinder's internal ID for the result.
   * @param  {String}   query       Optional. Search terms.
   * @param  {Function} callback    Optional callback to be called when the
   *                                response is received. First param is the
   *                                error, if any, and the second one is the
   *                                response, if any.
   * @public
  ###
  registerClick: (session_id, dfid, query, callback) ->
    params =
      session_id: session_id
      dfid: dfid
      query: query or ""

    @client.stats "click", params, callback

  ###*
   * Registers a checkout.
   *
   * @param  {String}  	session_id  Session id.
   * @param  {Function} callback    Optional callback to be called when the
   *                                response is received. First param is the
   *                                error, if any, and the second one is the
   *                                response, if any.
   * @public
  ###
  registerCheckout: (session_id, callback) ->
    @client.stats "checkout", session_id: session_id, callback

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
