(function() {
  module.exports = {
    extend: function() {
      var i, key;
      i = 1;
      while (i < arguments.length) {
        for (key in arguments[i]) {
          if (arguments[i].hasOwnProperty(key)) {
            arguments[0][key] = arguments[i][key];
          }
        }
        i++;
      }
      return arguments[0];
    }
  };

}).call(this);
