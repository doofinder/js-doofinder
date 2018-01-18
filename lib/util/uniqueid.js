(function() {
  var cleandfid, md5;

  md5 = require("md5");

  cleandfid = function(dfid) {
    if (/^\w{32}@[\w_-]+@\w{32}$/.test(dfid)) {
      return dfid;
    } else {
      throw new Error("dfid: " + dfid + " is not valid.");
    }
  };

  module.exports = {
    clean: {
      dfid: cleandfid
    },
    generate: {
      dfid: function(id, datatype, hashid) {
        id = md5("" + id);
        return cleandfid(hashid + "@" + datatype + "@" + id);
      },
      easy: function(length) {
        var id;
        if (length == null) {
          length = 8;
        }
        id = "";
        while (id.length < length) {
          id += Math.random().toString(36).substr(2);
        }
        return id.substr(0, length);
      },
      hash: function() {
        return md5([new Date().getTime(), String(Math.floor(Math.random() * 10000))].join(""));
      },
      browserHash: function() {
        return md5([navigator.userAgent, navigator.language, window.location.host, new Date().getTime(), String(Math.floor(Math.random() * 10000))].join(""));
      }
    }
  };

}).call(this);
