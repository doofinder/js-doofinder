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
  registerClick: (query, session_id, callback) ->
    params =
      session_id: session_id
      query: query

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
  registerCheckout: (session_id, callback) ->
    if sessionExists
      @client.stats "checkout", session_id: session_id, (err, res) =>
        unless err?
          @session.clean()
        callback? err, res

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
