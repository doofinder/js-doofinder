
/**
 * Converts text in camel case to dash case
 * @param  {String} text Text in camelCase
 * @return {String}      Text converted to dash-case
 */

(function() {
  var camel2dash, cleanXSS, dash2camel, dash2class, myUnescape, toSnake, translate, ucfirst, ucwords;

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

  ucwords = function(text) {
    return text.replace(/(^|\s)\S/g, function(c) {
      return c.toUpperCase();
    });
  };

  ucfirst = function(text) {
    return text.replace(/^\S/g, function(c) {
      return c.toUpperCase();
    });
  };

  toSnake = function(text) {
    return text.replace(/\s+/g, '_');
  };

  translate = function(text, translations) {
    return translations[text] || text;
  };

  myUnescape = function(text) {
    var unescaped_text;
    unescaped_text = decodeURIComponent(text);
    while (unescaped_text !== text) {
      text = unescaped_text;
      unescaped_text = decodeURIComponent(text);
    }
    return unescaped_text;
  };

  cleanXSS = function(text) {
    var doc;
    text = myUnescape(text);
    doc = (new DOMParser()).parseFromString(text, "text/html");
    return doc.body.textContent || "";
  };

  module.exports = {
    camel2dash: camel2dash,
    dash2camel: dash2camel,
    dash2class: dash2class,
    ucwords: ucwords,
    ucfirst: ucfirst,
    toSnake: toSnake,
    translate: translate,
    unescape: myUnescape,
    cleanXSS: cleanXSS
  };

}).call(this);
