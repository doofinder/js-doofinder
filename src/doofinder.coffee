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
  constructor: (@hashid, api_key, rpp) ->
    @version = "4"
    
    @params =
      query: ""
      filters: {}
      rpp: 10
      page: 1
      transformer: "dflayer"
      params_preffix: "dfParam_"
    
    if api_key
      [ zone, @api_key ] = api_key.split '-'
      @url = zone + "-search.doofinder.com"

    if rpp
      @params.rpp = rpp
  
  ###
  search

  Method responsible of executing call.

  @param {Function} callback (err, res)
  @api public
  ###
  search: (callback) ->
    headers = {}
    headers["API Token"] = @api_key
    
    query_string = @make_querystring()
    
    # Preparing request variables
    options = 
      host: @url
      port: @port
      path: "/#{@version}/search?#{query_string}"
      headers: headers

    if @port
      options.port = @port

    # Callback function will be passed as argument to search
    # and will be returned with response body
    process_response = (res) ->
      if res.statusCode >= 400
        return callback res.statusCode, null
      
      else 
        res.on 'data', (chunk) ->
          res_json = JSON.parse(chunk)
          return callback null, res_json

        res.on 'error', (err) ->
          return callback err, null

    # Here is where request is done and executed process_response
    req = http.request options, process_response
    req.end()

  ###
  add_query

  This method adds a query
  @param {String} query
  @api public
  ###
  add_query: (term) ->
    @params.query = term

  ###
  add_filter

  This method adds a filter to query
  @param {String} filter_key
  @param {Array} filter_values
  @api public
  ###
  add_filter: (filter_key, filter_values) ->
    @params.filters[filter_key] = filter_values

  ###
  add_term

  This method adds a term to a filter.
  If filter does not exists, the method
  creates it
  @param {String} filter_key
  @param {String} term
  @api public
  ###
  add_filter_term: (filter_key, term) ->
    if not @params.filters[filter_key]
      @params.filters[filter_key] = []
    @params.filters[filter_key].push(term)

  ###
  add_range
  
  This method adds a range filter
  @param {String} filter_key
  @param {int} from
  @param {int} to
  @api public
  ###
  add_filter_range: (filter_key, from, to) ->
    @params.filters[filter_key] =
      from: from
      to: to

  ###
  make_querystring

  This method prepare returns a
  querystring for request

  @returns {String} querystring
  @api private
  ###
  make_querystring: () ->
    querystring = "hashid=#{@hashid}"
    querystring += "&rpp=#{@params.rpp}"
    querystring += "&page=#{@params.page}"

    console.log JSON.stringify(@params.filters)

    for key, value of @params.filters
      console.log key
      # Range filters
      if value.constructor == Object and value['from'] and value['to']
        querystring += "&filter[#{key}][gte]=#{value['from']}"
        querystring += "&filter[#{key}][lt]=#{value['to']}"
      
      # Terms filters
      if value.constructor == Array
        for elem in value
          querystring += "@filter[#{key}]=#{elem}"

    return querystring 

# Module exports
module.exports = Doofinder