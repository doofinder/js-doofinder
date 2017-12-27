
/**
 * Converts text in camel case to dash case
 * @param  {String} text Text in camelCase
 * @return {String}      Text converted to dash-case
 */

(function() {
  var camel2dash, dash2camel, dash2class;

  camel2dash = function(text) {
    return text.replace(/[A-Z]/g, (function(m) {
      return "-" + m.toLowerCase();
    }));
  };


  /**
   * Converts text in dash case to camel case
   * @param  {String} text Text in dash-case
   * @return {String}      Text converted to camelCase
   */

  dash2camel = function(text) {
    text = text.replace(/([-_])([^-_])/g, (function(m, p1, p2) {
      return p2.toUpperCase();
    }));
    return text.replace(/[-_]/g, "");
  };

  dash2class = function(text) {
    return (dash2camel(text)).replace(/^./, function(m) {
      return m.toUpperCase();
    });
  };

  module.exports = {
    camel2dash: camel2dash,
    dash2camel: dash2camel,
    dash2class: dash2class
  };

}).call(this);
