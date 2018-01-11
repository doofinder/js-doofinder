http = require "http"
https = require "https"

extend = require "extend"

errors = require "./errors"
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
      throw (errors.error "A callback is needed!", @)

    req = @http.get options, (response) ->
      data = ""
      response.setEncoding "utf-8"
      response
        .on "data", ((chunk) -> data += chunk)
        .on "end", (->
          if response.statusCode is 200
            callback undefined, (JSON.parse data)
          else
            try
              error = JSON.parse data
            catch e
              error = error: data
            callback (extend true, (statusCode: response.statusCode), error)
        )
      response

    req.on "error", (error) ->
      callback error: error

    req

module.exports = HttpClient
