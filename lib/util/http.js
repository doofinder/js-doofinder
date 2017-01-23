
/*
client.coffee
author: @ecoslado
2017 01 23
 */

(function() {
  var HttpClient, httpLib, httpsLib;

  httpLib = require("http");

  httpsLib = require("https");


  /*
  HttpClient
  This class implements a more
  easy API with http module
   */

  HttpClient = (function() {

    /*
    Just assigns
     */
    function HttpClient(ssl) {
      this.client = ssl ? httpsLib : httpLib;
    }

    HttpClient.prototype.request = function(options, callback) {
      var req;
      if (typeof options === "string") {
        options = {
          host: options
        };
      }
      req = this.__makeRequest(options, callback);
      return req.end;
    };


    /*
    Callback function will be passed as argument to search
    and will be returned with response body
    
    @param {Object} res: the response
    @api private
     */

    HttpClient.prototype.__processResponse = function(callback) {
      return function(res) {
        var data;
        if (res.statusCode >= 400) {
          return callback(res.statusCode, null);
        } else {
          data = "";
          res.on('data', function(chunk) {
            return data += chunk;
          });
          res.on('end', function() {
            return callback(null, JSON.parse(data));
          });
          return res.on('error', function(err) {
            return callback(err, null);
          });
        }
      };
    };


    /*
    Method to make a secured or not request based on @client
    
    @param (Object) options: request options
    @param (Function) the callback function to execute with the response as arg
    @return (Object) the request object.
    @api private
     */

    HttpClient.prototype.__makeRequest = function(options, callback) {
      return this.client.get(options, this.__processResponse(callback));
    };

    return HttpClient;

  })();

  module.exports = HttpClient;

}).call(this);
