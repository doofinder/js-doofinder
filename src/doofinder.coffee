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
  DfClient constructor

  @param {String} hashid
  @param {String} api_key
  @api public
  ###
  constructor: (@hashid, api_key, url, port, rpp) ->
    @version = "4"
    @rpp = 10
    @page = 1
    @transformer = "dflayer"
    @params_preffix = "dfParam_"
    @params = {}
    
    if api_key
      [ zone, @api_key ] = api_key.split '-'
      @url = zone + "-search.doofinder.com"

    if url
      @url = url

    if port
      @port = port

    if rpp
      @rpp = rpp
  
  ###
  search

  Method responsible of executing call.

  @param {Function} callback (err, res)
  @api public
  ###
  search: (callback) ->
    headers = {}
    headers["API Token"] = @api_key
    query_string = "hashid=#{@hashid}"
    
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
      if res.statusCode > 400
        return callback res.statusCode, null
      else 
        res.on 'data', (chunk) ->
          res_json = JSON.parse(chunk)
          @total_results = res_json.total
          @results = res_json.results
          return callback null, res_json

        res.on 'error', (err) ->
          return callback err, null

    # Here is where request is done and executed process_response
    req = http.request options, process_response
    req.end()

  ###
  add_filter

  This method adds a filter to query
  @param {String} filter_key
  @param {Array} filter_values
  @api public
  ###
  add_filter: (filter_key, filter_values) ->
    @params[filter_name] = filter_values

  ###
  add_term

  This method adds a term to a filter.
  If filter does not exists, the method
  creates it
  @param {String} filter_key
  @param {String} term
  @api public
  ###
  add_term: (filter_key, term) ->
    if not @params[filter_key]
      @params[filter_key] = []
    @params[filter_key].push(term)

  ###
  add_range
  
  This method adds a range filter
  @param {String} filter_key
  @param {int} from
  @param {int} to
  @api public
  ###
  add_range: (filter_key, from, to) ->
    @params[filter_key] =
      from: from
      to: to

# Module exports
module.exports = Doofinder