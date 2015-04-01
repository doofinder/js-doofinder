###
# js-doofinder
# author: @ecoslado
# 2015 04 01
###

http = require "http"

###
# DfClient
# This class is import with the module
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
  constructor: (@hashid, api_key, url, port) ->
    if api_key
      [ zone, @api_key ] = api_key.split '-'
      @url = zone + "-search.doofinder.com"

    if url
      @url = url

    if port
      @port = port
  
  ###
  Method responsible of searching.

  @param {String} query
  @param {Object} extra_headers
  @param {Object} extra_args
  @param {Function} callback (err, res)
  @api public
  ###
  search: (query, extra_headers, extra_args, callback) ->
    # Preparing request variables
  	options = 
      host: @url
      path: "/4/search?hashid=#{ @hashid }&query=#{ query }"

    if not extra_headers
      extra_headers = {}

    extra_headers["API Token"] = @api_key
    options.headers = extra_headers
    
    if @port
      options.port = @port

    # Callback function will be passed as argument to search
    # and will be returned with response body
    process_response = (res) ->
      if res.statusCode > 400
        return callback res.statusCode, null
      else 
        res.on 'data', (chunk) ->
          return callback null, chunk

        res.on 'error', (err) ->
          return callback err, null

    # Here is where request is done and executed process_response
    req = http.request options, process_response
    req.end()

# Module exports
module.exports = Doofinder