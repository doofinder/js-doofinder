###
# js-doofinder
# author: @ecoslado
# 2015 04 01
###

http = require "http"

###
# DfClient
# This class is imported with module
# requirement. Implements the search request
# and returns a json object to a callback function
###

class Doofinder
  ###
  Doofinder constructor

  @param {String} hashid
  @param {String} api_key
  @api public
  ###
  constructor: (@hashid, zone, api_key, address) ->
    @version = "4"
    @params = {}
    @filters = {}
    @url ?= address 
    @url ?= zone + "-search.doofinder.com"
    @api_key ?= api_key
  
  ###   
  _sanitizeQuery
  very crude check for bad intentioned queries
     
  checks if words are longer than 55 chars and the whole query is longer than 255 chars
  @param string query
  @return string query if it's ok, empty space if not
  ###
  _sanitizeQuery: (query, callback) ->
    max_word_length = 55
    max_query_length = 255
    if query == null or not query.constructor == String
      throw Error "Query must be a String"

    query = query.replace(/ +/g, ' ').replace(/^ +| +$/g, '') # query.trim() is ECMAScript5
      
    if query.length > max_query_length
      throw Error "Maximum query length exceeded: #{max_query_length}."

    for i, x of query.split(' ')
      if x.length > max_word_length
        throw Error "Maximum word length exceeded: #{max_word_length}."

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
      _this.params = {}
      _this.filters = {}
      _this.sort = []

      for param_key, param_value of params
        if param_key == "filters"
          for filter_key, filter_terms of param_value
            _this.add_filter(filter_key, filter_terms)
        
        else if param_key == "sort"
          _this.set_sort(param_value)
        
        else
          _this.add_param(param_key, param_value)

      query_string = _this.make_querystring()
      
      # Preparing request variables
      options = 
        host: _this.url
        path: "/#{_this.version}/search?#{query_string}"
        headers: headers


      # Callback function will be passed as argument to search
      # and will be returned with response body
      process_response = (res) ->
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

      # Here is where request is done and executed process_response
      req = http.request options, process_response
      req.end()

  ###
  add_param

  This method set simple params
  @param {String} name of the param
  @value {mixed} value of the param
  @api public
  ###

  add_param: (param, value) ->
    if value != null
      @params[param] = value
    else
      @params[param] = ""  

  ###
  add_filter

  This method adds a filter to query
  @param {String} filter_key
  @param {Array|Object} filter_values
  @api public
  ###
  add_filter: (filter_key, filter_values) ->
    @filters[filter_key] = filter_values

  ###
  set_sort

  This method adds sort to object 
  from an object or an array

  @param {Array|Object} sort
  ###
  set_sort: (sort) ->
    @sort = sort


  ###
  make_querystring

  This method returns a
  querystring for adding
  to Search API request.

  @returns {String} querystring
  @api private
  ###
  make_querystring: () ->
    # Adding hashid
    querystring = "hashid=#{@hashid}"
    
    # Adding params
    for key, value of @params
      querystring += "&#{key}=#{value}"
    
    # Adding filters
    for key, value of @filters
      # Range filters
      if value.constructor == Object and value['from'] and value['to']
        querystring += "&filter[#{key}][gte]=#{value['from']}"
        querystring += "&filter[#{key}][lt]=#{value['to']}"
      
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

# Module exports
module.exports = Doofinder