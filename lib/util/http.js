(function() {
  var HttpClient, Thing, http, https;

  http = require("http");

  https = require("https");

  Thing = require("./thing");


  /**
   * Commodity API to http and https modules
   */

  HttpClient = (function() {

    /**
     * @param  {Boolean} @secure If true, forces HTTPS.
     */
    function HttpClient(secure) {
      this.secure = secure;
      this.http = this.secure ? https : http;
    }


    /**
     * Performs a HTTP request expecting JSON to be returned.
     * @param  {Object}   options  Options needed by http.ClientRequest
     * @param  {Function} callback Callback to be called when the response is
     *                             received. First param is the error, if any,
     *                             and the second one is the response, if any.
     * @return {http.ClientRequest}
     */

    HttpClient.prototype.request = function(options, callback) {
      var req;
      if (Thing.isStr(options)) {
        options = {
          host: options
        };
      }
      if (!Thing.isFn(callback)) {
        throw new Error(this.constructor.name + ": A callback is needed!");
      }
      req = this.http.get(options, function(response) {
        var rawData;
        if (response.statusCode !== 200) {
          response.resume();
          return callback(response.statusCode);
        } else {
          response.setEncoding("utf-8");
          rawData = "";
          response.on("data", function(chunk) {
            return rawData += chunk;
          });
          return response.on("end", function() {
            return callback(void 0, JSON.parse(rawData));
          });
        }
      });
      req.on("error", function(error) {
        return callback(error);
      });
      return req;
    };

    return HttpClient;

  })();

  module.exports = HttpClient;

}).call(this);
