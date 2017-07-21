(function() {
  var HttpClient, http, https;

  http = require("http");

  https = require("https");


  /**
   * Commodity API to http and https modules
   */

  HttpClient = (function() {
    function HttpClient(secure) {
      this.secure = secure;
      this.http = this.secure ? https : http;
    }

    HttpClient.prototype.request = function(options, callback) {
      var req;
      if (typeof options === "string") {
        options = {
          host: options
        };
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
            return callback(null, JSON.parse(rawData));
          });
        }
      });
      return req.on("error", function(error) {
        return callback(error);
      });
    };

    return HttpClient;

  })();

  module.exports = HttpClient;

}).call(this);
