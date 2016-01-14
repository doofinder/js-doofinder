###
client.coffee
author: @ecoslado
2015 04 01
###

http = require "http"

###
DfClient
This class is imported with module
requirement. Implements the search request
and returns a json object to a callback function
###

class Client
  ###
  Client constructor

  @param {String} hashid
  @param {String} apiKey
  @param {String} version
  @param {String} address
  @api public
  ###
  constructor: (@hashid, apiKey, version, @type, address) ->
    @version ?= version
    @version ?= 5
    @params = {}
    @filters = {}
    @url ?= address
    # API Key can be two ways:
    # zone-APIKey
    # zone
    # We check if there is a -
    if apiKey
      zoneApiKey = apiKey.split('-');
      zone = zoneApiKey[0];
      if zoneApiKey.length > 1
        @apiKey = zoneApiKey[1];

    else
      zone = ""
      @apiKey = ""

    @url ?= zone + "-search.doofinder.com"

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
    if query == null or not query.constructor == String
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
  search: (query, arg1, arg2) ->

    # Managing different ways of
    # calling search

    # dfClient.search(query, callback)
    if arg1 and arg1.constructor == Function
      callback = arg1
      params = {}

    # dfClient.search(query, params, callback)
    else if arg1 and arg2 and arg1.constructor == Object
      callback = arg2
      params = arg1

    # Wrong call
    else
      throw new Error "A callback is required."

    # Set default params
    params.page ?= 1
    params.rpp ?= 10

    # Add query to params
    _this = @
    @_sanitizeQuery query, (res) ->
      params.query = res
      headers = {}
      if _this.apiKey
        headers['api token'] = _this.apiKey
      _this.params = {}
      _this.filters = {}
      _this.sort = []

      for paramKey, paramValue of params
        if paramKey == "filters"
          for filterKey, filterTerms of paramValue
            _this.addFilter(filterKey, filterTerms)

        else if paramKey == "sort"
          _this.setSort(paramValue)

        else
          _this.addParam(paramKey, paramValue)

      queryString = _this.makeQueryString()

      # Preparing request variables

      options =
        host: _this.url
        path: "/#{_this.version}/search?#{queryString}"
        headers: headers

      # Just for url with host:port
      if _this.url.split(':').length > 1
        options.host = _this.url.split(':')[0]
        options.port = _this.url.split(':')[1]


      # Callback function will be passed as argument to search
      # and will be returned with response body
      processResponse = (res) ->
        if res.statusCode >= 400
          return callback res.statusCode, null

        else
          data = ""
          res.on 'data', (chunk) ->
            data += chunk

          res.on 'end', () ->
            return callback null, JSON.parse(data)

          res.on 'error', (err) ->
            return callback err, null

      # Here is where request is done and executed processResponse
      req = http.request options, _this.__processResponse(callback)
      req.end()

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
  addFilter: (filterKey, filterValues) ->
    @filters[filterKey] = filterValues

  ###
  setSort

  This method adds sort to object
  from an object or an array

  @param {Array|Object} sort
  ###
  setSort: (sort) ->
    @sort = sort


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
    querystring = "hashid=#{@hashid}"

    # Adding types
    if @type and @type instanceof Array
      for key, value of @type
        querystring += "&type=#{value}"
    else if @type and @type.constructor == String
      querystring += "&type=#{@type}"

    # Adding params
    for key, value of @params
      querystring += "&#{key}=#{value}"

    # Adding filters
    for key, value of @filters
      # Range filters
      if value.constructor == Object
        for k, v of value
          querystring += "&filter[#{key}][#{k}]=#{v}"

      # Terms filters
      if value.constructor == Array
        for elem in value
          querystring += "&filter[#{key}]=#{elem}"

    # Adding sort options
    if @sort and @sort.constructor == Array
        for key, value of @sort
          for facet, term of value
            querystring += "&sort[#{key}][#{facet}]=#{term}"

    else if @sort and @sort.constructor == Object
      for key, value of @sort
        querystring += "&sort[#{key}]=#{value}"

    return encodeURI querystring

  ###
  This method calls to /hit
  service for accounting the
  hits in a product

  @param {String} dfid
  @param {String} query
  @param {Function} callback
  @api public
  ###
  hit: (dfid, query = "", callback = (err, res) ->) ->
    headers = {}
    if @apiKey
        headers['api token'] = _this.apiKey
    options =
        host: @url
        path: "/#{@version}/hit/#{@hashid}/#{dfid}/#{encodeURIComponent(query)}?random=#{new Date().getTime()}"
        headers: headers

    # Here is where request is done and executed processResponse
    req = http.request options, @__processResponse(callback)
    req.end()

  ###
  This method calls to /hit
  service for accounting the
  hits in a product

  @param {String} dfid
  @param {String} query
  @param {Function} callback
  @api public
  ###
  options: (callback = (err, res) ->) ->
    headers = {}
    if @apiKey
        headers['api token'] = _this.apiKey
    options =
        host: @url
        path: "/#{@version}/options/#{@hashid}"
        headers: headers

    # Here is where request is done and executed processResponse
    req = http.request options, @__processResponse(callback)
    req.end()

  ###
  Callback function will be passed as argument to search
  and will be returned with response body

  @param {Object} res: the response
  @api private
  ###
  __processResponse: (callback) ->
    (res) ->
      if res.statusCode >= 400
        return callback res.statusCode, null

      else
        data = ""
        res.on 'data', (chunk) ->
          data += chunk

        res.on 'end', () ->
          return callback null, JSON.parse(data)

        res.on 'error', (err) ->
          return callback err, null

# Module exports
module.exports = Client
