(function() {
  module.exports = {
    toDashCase: function(name) {
      return name.replace(/[A-Z]/g, (function(m) {
        return "-" + m.toLowerCase();
      }));
    },
    toCamelCase: function(name) {
      name = name.replace(/([-_])([^-_])/g, (function(m, p1, p2) {
        return p2.toUpperCase();
      }));
      return name.replace(/[-_]/g, "");
    }
  };

}).call(this);
