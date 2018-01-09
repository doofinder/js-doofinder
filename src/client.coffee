extend = require "extend"
md5 = require "md5"
qs = require "qs"

errors = require "./util/errors"
HttpClient = require "./util/http"
Thing = require "./util/thing"

###*
 * This class allows searching and sending stats using the Doofinder service.
###
class Client
  ###*
   * Constructor
   * @param  {String}       hashid  Unique ID of the Search Engine.
   * @param  {String}       apiKey  Search zone (eu1, us1) or full API key
   *                                (eu1-...).
   * @param  {Number}       version API version.
   * @param  {String|Array} type    Restricts search to one or more data types.
   * @param  {[type]}       address Search server endpoint. Used by the
   *                                development team.
   * @public
  ###
  constructor: (@hashid, zoneOrKey, version = 5, @type, address) ->
    [zone, apiKey] = if zoneOrKey? then zoneOrKey.split "-" else ["", undefined]
    address ?= "#{zone}-search.doofinder.com"
    [host, port] = address.split ":"

    @defaultOptions =
      host: host
      port: port
      headers: {}
    @defaultOptions.headers.authorization = apiKey if apiKey?
    @version = "#{parseInt version, 10}"

    @httpClient = new HttpClient apiKey?

  ###*
   * Performs a HTTP request to the endpoint specified with the default options
   * of the client.
   *
   * @param  {String}   resource Resource to be called by GET.
   * @param  {Function} callback Callback to be called when the response is
   *                             received. First param is the error, if any,
   *                             and the second one is the response, if any.
   * @return {http.ClientRequest}
   * @public
  ###
  request: (resource, callback) ->
    options = extend true, path: resource, @defaultOptions
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
   * @param  {String}   eventName Type of stats. Configures the endpoint.
   * @param  {Object}   params    Parameters for the query string.
   * @param  {Function} callback  Callback to be called when the response is
   *                              received. First param is the error, if any,
   *                              and the second one is the response, if any.
   * @return {http.ClientRequest}
  ###
  stats: (eventName, params, callback) ->
    eventName ?= ""
    defaultParams =
      hashid: @hashid
      random: new Date().getTime()
    querystring = qs.stringify (extend true, defaultParams, (params or {}))
    querystring = "?#{querystring}" if querystring
    @request "/#{@version}/stats/#{eventName}#{querystring}", callback

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
    query ?= ""
    query = (query.replace /\s+/g, " ")
    query = query.trim() unless query is " "

    defaultParams =
      hashid: @hashid
      type: @type
      # page: 1  # Doofinder assumes this by default
      # rpp: 10  # Doofinder assumes this by default
      # filter: {}
      # exclude: {}
      # sort: []
      # transformer: null
      # query_counter: 1

    queryParams = extend true, defaultParams, (params or {}), query: query

    if Thing.is.array(queryParams.type) and queryParams.type.length is 1
      queryParams.type = queryParams.type[0]

    if Thing.is.hash(queryParams.sort) and
        (Object.keys queryParams.sort).length > 1
      throw (errors.error "To sort by multiple fields use an Array of Objects", @)

    # if we skip nulls, transformer won't ever be sent as empty!
    # so, if you don't want a param to be present, just don't add it or set
    # it as undefined
    qs.stringify queryParams, skipNulls: false


module.exports = Client
