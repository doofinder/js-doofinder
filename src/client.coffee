###
client.coffee
author: @ecoslado
2015 04 01
###

HttpClient = require "./util/http"
md5 = require "md5"
extend = require "extend"


###*
 * This class allows searching and sending stats using the Doofinder service.
###
class Client
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

    @params = {}
    @filters = {}
    @exclude = {}

    @httpClient = new HttpClient apiKey?

  ###*
   * Performs a HTTP request to the endpoint specified with the default options
   * of the client.
   *
   * @param  {String}   url      Endpoint URL.
   * @param  {Function} callback Callback to be called when the response is
   *                             received. First param is the error, if any
   *                             and the second one is the response, if any.
   * @return {http.ClientRequest}
   * @public
  ###
  request: (url, callback) ->
    options = extend true, path: url, @defaultOptions
    @httpClient.request options, callback


  ###
  _sanitizeQuery
  very crude check for bad intentioned queries

  checks if words are longer than 55 chars and the whole query is longer than 255 chars
  @param string query
  @return string query if it's ok, empty space if not
  ###
  _sanitizeQuery: (query, callback) ->
    maxWordLength = 55
    maxQueryLength = 255
    if typeof(query) == "undefined"
      throw Error "Query must be a defined"

    if query == null or query.constructor != String
      throw Error "Query must be a String"

    query = query.replace(/ +/g, ' ').replace(/^ +| +$/g, '') # query.trim() is ECMAScript5

    if query.length > maxQueryLength
      throw Error "Maximum query length exceeded: #{maxQueryLength}."

    for i, x of query.split(' ')
      if x.length > maxWordLength
        throw Error "Maximum word length exceeded: #{maxWordLength}."

    return callback query


  ###
  search

  Method responsible of executing call.

  @param {Object} params
    i.e.:

      query: "value of the query"
      page: 2
      rpp: 25
      filters:
        brand: ["nike", "adidas"]
        color: ["blue"]
        price:
          from: 40
          to: 150

  @param {Function} callback (err, res)
  @api public
  ###
  search: (query, args...) ->
    # Managing different ways of calling search
    if args.length == 1 # dfClient.search(query, callback)
      params = {}
      callback = args[0]
    else if args.length == 2 # dfClient.search(query, params, callback)
      params = args[0]
      callback = args[1]
    else # Wrong call
      throw new Error "A callback is required."

    # Set default params
    params.page ?= 1
    params.rpp ?= 10

    # Add query to params
    @_sanitizeQuery query, (cleaned) =>
      params.query = cleaned

      @params = {}
      @filters = {}
      @sort = []

      for paramKey, paramValue of params
        if paramKey == "filters" or paramKey == "exclude"
          for filterKey, filterTerms of paramValue
            @addFilter(filterKey, filterTerms, paramKey)

        else if paramKey == "sort"
          @setSort(paramValue)

        else
          @addParam(paramKey, paramValue)

      queryString = @makeQueryString()
      path = "/#{@version}/search?#{queryString}"

      @request path, callback

  ###
  addParam

  This method set simple params
  @param {String} name of the param
  @value {mixed} value of the param
  @api public
  ###

  addParam: (param, value) ->
    if value != null
      @params[param] = value
    else
      @params[param] = ""

  ###
  addFilter

  This method adds a filter to query
  @param {String} filterKey
  @param {Array|Object} filterValues
  @api public
  ###
  addFilter: (filterKey, filterValues, type="filters") ->
    this[type][filterKey] = filterValues

  ###
  setSort

  This method adds sort to object
  from an object or an array

  @param {Array|Object} sort
  ###
  setSort: (sort) ->
    @sort = sort


  ###
  __escapeChars

  This method encodes just the chars
  like &, ?, #.

  @param {String} word
  ###
  __escapeChars: (word) ->
    word
      .replace(/\&/g, "%26")
      .replace(/\?/g, "%3F")
      .replace(/\+/g, "%2B")
      .replace(/\#/g, "%23")

  ###
  makeQueryString

  This method returns a
  querystring for adding
  to Search API request.

  @returns {String} querystring
  @api private
  ###
  makeQueryString: () ->
    # Adding hashid
    querystring = encodeURI "hashid=#{@hashid}"

    # Adding types
    if @type and @type instanceof Array
      for key, value of @type
        querystring += encodeURI "&type[]=#{value}"
    else if @type and @type.constructor == String
      querystring += encodeURI "&type=#{@type}"
    else if @params.type and @params.type instanceof Array
      for key, value of @params.type
        querystring += encodeURI "&type[]=#{value}"
    else if @params.type and @params.type.constructor == String
      querystring += encodeURI "&type=#{@type}"

    # Adding params
    for key, value of @params
      if key == "query"
        querystring += encodeURI "&#{key}="
        querystring += encodeURIComponent value
      else if key != "type"
        querystring += encodeURI "&#{key}=#{value}"

    # Adding filters
    for key, value of @filters
      # Range filters
      if value.constructor == Object
        for k, v of value
          querystring += encodeURI "&filter[#{key}][#{k}]=#{v}"

      # Terms filters
      if value.constructor == Array
        for elem in value
          # escapeChars encodes &#? characters
          # those characters that encodeURI doesn't
          segment = @__escapeChars encodeURI "filter[#{key}]=#{elem}"
          querystring += "&#{segment}"

    # Adding filters
    for key, value of @exclude
      # Range filters
      if value.constructor == Object
        for k, v of value
          querystring += encodeURI "&exclude[#{key}][#{k}]=#{v}"

      # Terms filters
      if value.constructor == Array
        for elem in value
          # escapeChars encodes &#? characters
          # those characters that encodeURI doesn't
          segment = @__escapeChars encodeURI "exclude[#{key}]=#{elem}"
          querystring += "&#{segment}"

    # Adding sort options
    # See http://doofinder.com/en/developer/search-api#sort-parameters
    if @sort and @sort.constructor == Array
      for value in @sort
        for facet, term of value
          querystring += encodeURI "&sort[#{@sort.indexOf(value)}][#{facet}]=#{term}"

    else if @sort and @sort.constructor == String
      querystring += encodeURI "&sort=#{@sort}"


    else if @sort and @sort.constructor == Object
      for key, value of @sort
        querystring += encodeURI "&sort[#{key}]=#{value}"

    return querystring

  ###
  This method calls to /stats/click
  service for accounting the
  clicks to a product

  @param {String} productId
  @param {Object} options
  @param {Function} callback

  @api public
  ###
  registerClick: (productId, args...) ->
    # Defaults
    callback = ((err, res) ->)
    options = {}
    # Casting to string (just in case)
    productId += ''

    # Check how many args there are
    if args.length == 1
      if typeof args[0] == 'function' # dfClient.registerClick(query, callback)
        callback = args[0]
      else # dfClient.registerClick(query, options)
        options = args[0]
    else if args.length == 2 # dfClient.registerClick(query, options, callback)
      options = args[0]
      callback = args[1]


    # doofinder internal id regex
    dfidRe = /\w{32}@[\w_-]+@\w{32}/
    # You can receive the dfid
    if dfidRe.exec(productId)
      dfid = productId
    # Or just md5(product_id)
    else
      datatype = options.datatype || "product"
      dfid = "#{@hashid}@#{datatype}@#{md5(productId)}"
    # Optional args
    sessionId = options.sessionId || "session_id"
    query = options.query || ""
    path = "/#{@version}/stats/click?dfid=#{dfid}&session_id=#{sessionId}&query=#{encodeURIComponent(query)}"
    path += "&random=#{new Date().getTime()}"

    @request path, callback


  ###
  This method calls to /stats/init_session
  service for init a user session

  @param {String} sessionId
  @param {Function} callback

  @api public
  ###
  registerSession: (sessionId, callback=((err, res)->)) ->
    path = "/#{@version}/stats/init?hashid=#{@hashid}&session_id=#{sessionId}"
    path += "&random=#{new Date().getTime()}"

    @request path, callback


  ###
  This method calls to /stats/checkout
  service for init a user session

  @param {String} sessionId
  @param {Object} options
  @param {Function} callback

  @api public
  ###
  registerCheckout: (sessionId, callback) ->
    # Defaults
    callback = callback || ((err, res) ->)

    path = "/#{@version}/stats/checkout?hashid=#{@hashid}&session_id=#{sessionId}"
    path += "&random=#{new Date().getTime()}"

    @request path, callback

  ###
  This method calls to /stats/banner_<event_type>
  service for registering banner events like display
  or click

  @param {String} eventType
  @param {Object} bannerId
  @param {Function} callback

  @api public
  ###
  registerBannerEvent: (eventType, bannerId, callback=((err, res) ->)) ->
    path = "/#{@version}/stats/banner_#{eventType}?hashid=#{@hashid}&banner_id=#{bannerId}"
    path += "&random=#{new Date().getTime()}"

    @request path, callback


  ###
  This method calls to /hit
  service for accounting the
  hits in a product

  @param {String} dfid
  @param {Object | Function} arg1
  @param {Function} arg2
  @api public
  ###
  options: (args...) ->
    callback = ((err, res) ->)
    # You can send options and callback or just the callback
    if args.length == 1 # dfClient.opitons(query, callback)
      options = {}
      callback = args[0]
    else if args.length == 2 # dfClient.options(query, params, callback)
      options = args[0]
      callback = args[1]
    else # Wrong call
      throw new Error "A callback is required."

    if typeof options != "undefined" and options.querystring
      querystring = "?#{options.querystring}"
    else
      querystring = ""

    path = "/#{@version}/options/#{@hashid}#{querystring}"

    @request path, callback


module.exports = Client
