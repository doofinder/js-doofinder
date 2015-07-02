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
  constructor: (@hashid, api_key, localhost, localport) ->
    @version = "4"
    @params = {}
    @filters = {}
    
    if api_key
      [ zone, @api_key ] = api_key.split '-'
      @url = zone + "-search.doofinder.com"

    # Only for dev
    if localhost and localport
      @localhost = localhost
      @localport = localport
  
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
  search: (params, callback) ->
    headers = {}
    @params = {}
    @filters = {}
    for param_key, param_value of params
      if param_key == "filters"
        for filter_key, filter_terms of param_value
          @add_filter(filter_key, filter_terms)
      else
        @add_param(param_key, param_value)

    query_string = @make_querystring()
    
    # Preparing request variables
    options = 
      host: @url
      path: "/#{@version}/search?#{query_string}"
      headers: headers

    if @localhost and @localport
      options.host = @localhost
      options.port = @localport

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
  set_param

  This method set simple params
  @param {String} name of the param
  @value {mixed} value of the param
  @api public
  ###

  add_param: (param, value) ->
    @params[param] = value

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

    return encodeURI querystring 

# Module exports
module.exports = Doofinder