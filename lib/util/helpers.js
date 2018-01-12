(function() {
  var extend, translate;

  extend = require("extend");

  translate = (require("./text")).translate;

  module.exports = {
    addTranslateHelper: function(context, translations) {
      if (translations == null) {
        translations = {};
      }

      /**
       * Mustache helper to translate strings given a translations object in the
       * global context object. If no translation is found, the source text is
       * returned.
       */
      return extend(true, context, {
        "translate": function() {
          return function(text, render) {
            return translate(render(text), translations);
          };
        }
      });
    }
  };

}).call(this);
