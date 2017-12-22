(function() {
  module.exports = {

    /**
     * Converts text in camel case to dash case
     * @param  {String} text Text in camelCase
     * @return {String}      Text converted to dash-case
     */
    camel2dash: function(text) {
      return text.replace(/[A-Z]/g, (function(m) {
        return "-" + m.toLowerCase();
      }));
    },

    /**
     * Converts text in dash case to camel case
     * @param  {String} text Text in dash-case
     * @return {String}      Text converted to camelCase
     */
    dash2camel: function(text) {
      text = text.replace(/([-_])([^-_])/g, (function(m, p1, p2) {
        return p2.toUpperCase();
      }));
      return text.replace(/[-_]/g, "");
    }
  };

}).call(this);
