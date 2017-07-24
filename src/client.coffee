###
client.coffee
author: @ecoslado
2015 04 01
###

extend = require "extend"
md5 = require "md5"
qs = require "qs"

HttpClient = require "./util/http"

###*
 * This class allows searching and sending stats using the Doofinder service.
###
class Client
  @cb = (err, response) ->

  error: (message) ->
    throw new Error "#{@constructor.name}: #{message}"

  ###*
   * Constructor
   * @param  {String}       @hashid  Unique ID of the Search Engine.
   * @param  {String}       apiKey   Search zone (eu1, us1) or full API key
   *                                 (eu1-...).
   * @param  {Number}       @version API version.
   * @param  {String|Array} @type    Restricts search to one or more data types.
   * @param  {[type]}       address  Search server endpoint. Used by the
   *                                 development team.
   * @public
  ###
  constructor: (@hashid, zoneOrKey, @version = 5, @type, address) ->
    [zone, apiKey] = if zoneOrKey? then zoneOrKey.split "-" else ["", undefined]
    address ?= "#{zone}-search.doofinder.com"
    [host, port] = address.split ":"

    @defaultOptions =
      host: host
      port: port
      headers: {}
    @defaultOptions.headers.authorization = apiKey if apiKey?

    @httpClient = new HttpClient apiKey?

  ###*
   * Performs a HTTP request to the endpoint specified with the default options
   * of the client.
   *
   * @param  {String}   url      Endpoint URL.
   * @param  {Function} callback Callback to be called when the response is
   *                             received. First param is the error, if any,
   *                             and the second one is the response, if any.
   * @return {http.ClientRequest}
   * @public
  ###
  request: (url, callback) ->
    options = extend true, path: url, @defaultOptions
    @httpClient.request options, callback

  #
  # Main Endpoints
  #

  ###*
   * Performs a search request.
   *
   * @param  {String}   query    Search terms.
   * @param  {Object}   params   Parameters for the request. Optional.
   *
   *                             params =
   *                               page: Number
   *                               rpp: Number
   *                               type: String | [String]
   *                               filter:
   *                                 field: [String]
   *                                 field:
   *                                   from: Number
   *                                   to: Number
   *                               exclude:
   *                                 field: [String]
   *                                 field:
   *                                   from: Number
   *                                   to: Number
   *                               sort: String
   *                               sort:
   *                                 field: "asc" | "desc"
   *                               sort: [{field: "asc|desc"}]
   *
   * @param  {Function} callback Callback to be called when the response is
   *                             received. First param is the error, if any,
   *                             and the second one is the response, if any.
   * @return {http.ClientRequest}
   * @public
  ###
  search: (query, params, callback) ->
    if arguments.length is 2
      callback = params
      params = {}

    # Basic cleanup
    query = (query.replace /\s+/g, " ")
    query = query.trim() unless query is " "

    querystring = @__buildSearchQueryString query, params
    @request "/#{@version}/search?#{querystring}", callback

  ###*
   * Perform a request to get options for a search engine.
   *
   * @param  {String}   suffix   Optional suffix to add to the request URL. Can
   *                             be something like a domain, so the URL looks
   *                             like /<version>/options/<hashid>?example.com.
   * @param  {Function} callback Callback to be called when the response is
   *                             received. First param is the error, if any,
   *                             and the second one is the response, if any.
   * @return {http.ClientRequest}
   * @public
  ###
  options: (suffix, callback) ->
    if arguments.length is 1
      callback = suffix
      suffix = ""

    suffix = if suffix then "?#{suffix}" else ""
    @request "/#{@version}/options/#{@hashid}#{suffix}", callback

  ###*
   * Performs a request to submit stats events to Doofinder.
   *
   * @param  {String}   type      Type of stats. Configures the endpoint.
   * @param  {Object}   params    Parameters for the query string.
   * @param  {Function} callback  Optional callback to be called when the
   *                              response is received. First param is the
   *                              error, if any, and the second one is the
   *                              response, if any. If not provided, it
   *                              defaults to a foo() callback.
   * @return {http.ClientRequest}
  ###
  stats: (type, params, callback = @constructor.cb) ->
    defaultParams =
      hashid: @hashid
      random: new Date().getTime()
    querystring = qs.stringify (extend true, defaultParams, (params or {}))
    @request "/#{@version}/stats/#{@type}#{querystring}", callback

  ###*
   * Creates a search query string for the specified query and parameters
   * intended to be used in the search API endpoint.
   *
   * NOTICE:
   *
   * - qs library encodes "(" and ")" as "%28" and "%29" although is not
   *   needed. Encoded parentheses must be supported in the search endpoint.
   * - Iterating objects doesn't ensure the order of the keys so they can't be
   *   reliabily used to specify sorting in multiple fields. That's why this
   *   method validates sorting and raises an exception if the value is not
   *   valid.
   *
   *   - sort: field                                         [OK]
   *   - sort: {field: 'asc|desc'}                           [OK]
   *   - sort: [{field1: 'asc|desc'}, {field2: 'asc|desc'}]  [OK]
   *   - sort: {field1: 'asc|desc', field2: 'asc|desc'}      [ERR]
   *
   * @param  {String} query  Cleaned search terms.
   * @param  {Object} params Search parameters object.
   * @return {String}        Encoded query string to be used in a search URL.
   * @protected
  ###
  __buildSearchQueryString: (query, params) ->
    defaultParams =
      hashid: @hashid
      type: @type
      page: 1
      rpp: 10
      filter: {}
      exclude: {}
      sort: []

    queryParams = extend true, defaultParams, (params or {}), query: query

    if typeof queryParams.sort is "object" and
        not queryParams.sort instanceof Array and
        (Object.keys queryParams.sort).length > 1
      @error "To sort by multiple fields use an Array of Objects"

    return qs.stringify queryParams, skipNulls: true


module.exports = Client
