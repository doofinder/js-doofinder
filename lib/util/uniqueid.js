(function() {
  var errors, generateDoofinderId, isValidDoofinderId, md5, splitDoofinderId;

  md5 = require("md5");

  errors = require("./errors");

  isValidDoofinderId = function(text) {
    return (splitDoofinderId(text)) !== text;
  };

  generateDoofinderId = function(id, datatype, hashid) {
    var dfid;
    id = md5("" + id);
    dfid = hashid + "@" + datatype + "@" + id;
    if (isValidDoofinderId(dfid)) {
      return dfid;
    } else {
      throw errors.error("can't generate a dfid: invalid input data.");
    }
  };

  splitDoofinderId = function(text) {
    var m;
    m = text.match(/^([0-9a-f]{32})@([\w-]+)@([0-9a-f]{32})$/i);
    if (m != null) {
      return {
        hashid: m[1],
        datatype: m[2],
        id: m[3]
      };
    } else {
      return text;
    }
  };

  module.exports = {
    dfid: {
      isValid: isValidDoofinderId,
      create: generateDoofinderId,
      split: splitDoofinderId
    },
    generate: {
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
