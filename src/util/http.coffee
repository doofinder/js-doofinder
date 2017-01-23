###
client.coffee
author: @ecoslado
2017 01 23
###

httpLib = require "http"
httpsLib = require "https"

###
HttpClient
This class implements a more
easy API with http module
###

class HttpClient

  ###
  Just assigns
  ###
  constructor: (ssl) ->
    @client = if ssl then httpsLib else httpLib


  request: (options, callback) ->
    if typeof options == "string"
      options = host: options
    req = @__makeRequest(options, callback)
    req.end 


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

  ###
  Method to make a secured or not request based on @client

  @param (Object) options: request options
  @param (Function) the callback function to execute with the response as arg
  @return (Object) the request object.
  @api private
  ###
  __makeRequest: (options, callback) ->
    @client.get options, @__processResponse(callback)

# Module exports
module.exports = HttpClient
    