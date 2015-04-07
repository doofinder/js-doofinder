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
      rpp: 10
      page: 1
      transformer: "dflayer"
    @filters = {}
    
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
    console.log query_string
    
    # Preparing request variables
    options = 
      host: @url
      path: "/#{@version}/search?#{query_string}"
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
  set_query

  This method set query terms
  @param {String} query
  @api public
  ###
  set_query: (term) ->
    @params.query = term


  ###
  set_query_name

  This method set query_name
  @param {String} query_name
  @api public
  ###
  set_query_name: (query_name) ->
    @params.query_name = query_name

  ###
  set_page

  This method set page
  @param {int} page
  @api public
  ###
  set_page: (page) ->
    @params.page = page

  ###
  set_transformer

  This method set transformer
  @param {String} transformer
  @api public
  ###
  set_transformer: (transformer) ->
    @params.transformer = transformer

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
  add_term

  This method adds a term to a filter.
  If filter does not exists, the method
  creates it
  @param {String} filter_key
  @param {String} term
  @api public
  ###
  add_filter_term: (filter_key, term) ->
    if not @filters[filter_key]
      @filters[filter_key] = []
    @filters[filter_key].push(term)

  ###
  add_range
  
  This method adds a range filter
  @param {String} filter_key
  @param {int} from
  @param {int} to
  @api public
  ###
  add_filter_range: (filter_key, from, to) ->
    @filters[filter_key] =
      from: from
      to: to

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