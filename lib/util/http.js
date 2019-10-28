(function() {
  var HttpClient, Thing, errors, http, https, merge;

  http = require("http");

  https = require("https");

  errors = require("./errors");

  merge = require("./merge");

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

    HttpClient.prototype.request = function(options, callback, payload) {
      var req;
      if (Thing.is.string(options)) {
        options = {
          host: options
        };
      }
      if (!Thing.is.fn(callback)) {
        throw errors.error("A callback is needed!", this);
      }
      if (payload != null) {
        options.method = "POST";
        options.headers['Content-Type'] = "application/json";
        payload = JSON.stringify(payload);
        options["Content-Length"] = payload.length;
      }
      req = this.http.request(options, function(response) {
        var data;
        data = "";
        response.setEncoding("utf-8");
        response.on("data", (function(chunk) {
          return data += chunk;
        })).on("end", (function() {
          var e, error, error1;
          if (response.statusCode === 200) {
            return callback(void 0, JSON.parse(data));
          } else {
            try {
              error = JSON.parse(data);
            } catch (error1) {
              e = error1;
              error = {
                error: data
              };
            }
            return callback(merge({
              statusCode: response.statusCode
            }, error));
          }
        }));
        return response;
      });
      req.on("error", function(error) {
        return callback({
          error: error
        });
      });
      if (options.method === 'POST') {
        req.write(payload);
      }
      req.end();
      return req;
    };

    return HttpClient;

  })();

  module.exports = HttpClient;

}).call(this);
