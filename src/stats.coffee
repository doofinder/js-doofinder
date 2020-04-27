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
   * @param  {String}  	sessionId Session id.
   * @param  {Function} callback  Optional callback to be called when the
   *                              response is received. First param is the
   *                              error, if any, and the second one is the
   *                              response, if any.
   * @public
  ###
  registerSession: (sessionId, callback) ->
    @client.stats "init", (session_id: sessionId), (err, res) ->
      callback? err, res # Client requires a callback, we don't

  ###*
   * Registers a click on a search result for the specified search query.
   *
   * stats = new doofinder.Stats(client);
   * stats.registerClick(sessionId, id, datatype, query, callback);
   * stats.registerClick(sessionId, dfid, query, callback);
   *
   * @param  {String}  	sessionId Session id.
   * @param  {String}   id        Id of the result or Doofinder's internal ID
   *                              for the result.
   * @param  {String}   datatype  Optional. If the id is not a Doofinder id
   *                              this argument is required.
   * @param  {String}   query     Optional. Search terms.
   * @param  {String}   custom_results_id Optional. Id of the custom results
   *                                      that produced the current set of
   *                                      results, including the current one
   *                                      being clicked.
   * @param  {Function} callback  Optional callback to be called when the
   *                              response is received. First param is the
   *                              error, if any, and the second one is the
   *                              response, if any.
   * @public
  ###
  registerClick: (sessionId, args...) ->
    errors.requireVal sessionId, "sessionId"

    if args.length is 0
      errors.requireVal null, "dfid or (id + datatype)"
    else if uniqueId.dfid.isValid args[0]
      required = ['dfid']
    else
      required = ['id', 'datatype']
    keys = required.concat ['query']

    params = session_id: sessionId
    params[key] = args.shift() for key in keys
    params.query ?= ""

    errors.requireVal params[key], key for key in required

    params['custom_results_id'] = args.shift() if typeof args[0] != "function"

    callback = args.shift()
    @client.stats "click", params, (err, res) ->
      callback? err, res # Client requires a callback, we don't

  ###*
   * Registers a checkout.
   *
   * @param  {String}  	sessionId Session id.
   * @param  {Function} callback  Optional callback to be called when the
   *                              response is received. First param is the
   *                              error, if any, and the second one is the
   *                              response, if any.
   * @public
  ###
  registerCheckout: (sessionId, callback) ->
    errors.requireVal sessionId, "sessionId"
    @client.stats "checkout", session_id: sessionId, (err, res) ->
      callback? err, res # Client requires a callback, we don't

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
    errors.requireVal eventName, "eventName"
    errors.requireVal bannerId, "bannerId"
    @client.stats "banner_#{eventName}", banner_id: bannerId, (err, res) ->
      callback? err, res # Client requires a callback, we don't

  ###*
   * Adds an amount of item in the current session cart
   * @param  {String}  	sessionId Session id.
   * @param  {String}  	itemId    The item ID to add to the cart.
   * @param  {String}  	amount    The amount of the item to be added.
   * @param  {String}  	datatype  (Default: product) The datatype of the 
   *                              item we are adding
   * @param  {Function} callback  Optional callback to be called when the
   *                              response is received. First param is the
   *                              error, if any, and the second one is the
   *                              response, if any.
   * @public
  ###
  addToCart: (sessionId, itemId, amount, datatype = "product", callback) ->
    errors.requireVal sessionId, "sessionId"
    errors.requireVal itemId, "itemId"
    errors.requireVal amount, "amount"

    params =
      session_id: sessionId
      item_id: itemId
      amount: amount
      datatype: datatype
             
    @client.stats "add_to_cart", params, (err, res) ->
      callback? err, res # Client requires a callback, we don't

  ###*
   * Removes an amount of item in the current session cart
   * @param  {String}  	sessionId Session id.
   * @param  {String}  	itemId    The item ID to add to the cart.
   * @param  {String}  	amount    The amount of the item to be removed.
   * @param  {String}  	datatype  (Default: product) The datatype of the 
   *                              item we are adding
   * @param  {Function} callback  Optional callback to be called when the
   *                              response is received. First param is the
   *                              error, if any, and the second one is the
   *                              response, if any.
   * @public
  ###
  removeFromCart: (sessionId, itemId, amount, datatype = "product", callback) ->
    errors.requireVal sessionId, "sessionId"
    errors.requireVal itemId, "itemId"
    errors.requireVal amount, "amount"

    params =
      session_id: sessionId
      item_id: itemId
      amount: amount
      datatype: datatype
             
    @client.stats "remove_from_cart", params, (err, res) ->
      callback? err, res # Client requires a callback, we don't

  ###*
   * Clears a cart from the current session, removing it all
   * @param  {String}  	sessionId Session id.
   * @param  {Function} callback  Optional callback to be called when the
   *                              response is received. First param is the
   *                              error, if any, and the second one is the
   *                              response, if any.
   * @public
  ###
  clearCart: (sessionId, callback) ->
    errors.requireVal sessionId, "sessionId"

    @client.stats "clear_cart", session_id, (err, res) ->
      callback? err, res # Client requires a callback, we don't

module.exports = Stats
