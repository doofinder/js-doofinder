http = require "http"
https = require "https"

Thing = require "./thing"

###*
 * Commodity API to http and https modules
###
class HttpClient
  ###*
   * @param  {Boolean} @secure If true, forces HTTPS.
  ###
  constructor: (@secure) ->
    @http = if @secure then https else http

  ###*
   * Performs a HTTP request expecting JSON to be returned.
   * @param  {Object}   options  Options needed by http.ClientRequest
   * @param  {Function} callback Callback to be called when the response is
   *                             received. First param is the error, if any,
   *                             and the second one is the response, if any.
   * @return {http.ClientRequest}
  ###
  request: (options, callback) ->
    if Thing.is.string options
      options = host: options

    unless Thing.is.fn callback
      throw new Error "#{@constructor.name}: A callback is needed!"

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
          callback undefined, (JSON.parse rawData)

    req.on "error", (error) ->
      callback error

    req

module.exports = HttpClient
