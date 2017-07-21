http = require "http"
https = require "https"

###*
 * Commodity API to http and https modules
###
class HttpClient
  constructor: (@secure) ->
    @http = if @secure then https else http

  request: (options, callback) ->
    if typeof options == "string"
      options = host: options

    req = @http.get options, (response) ->
      if response.statusCode isnt 200
        # consume response data to free up memory
        response.resume()
        callback response.statusCode
      else
        response.setEncoding "utf-8"

        rawData = ""
        response.on "data", (chunk) ->
          rawData += chunk

        response.on "end", ->
          callback null, (JSON.parse rawData)

    req.on "error", (error) ->
      callback error

module.exports = HttpClient
