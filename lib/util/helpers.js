(function() {
  var addHelpers, currency, extend, qs;

  extend = require("extend");

  qs = require("qs");

  currency = require("./currency");

  addHelpers = function(context) {
    var defaults, helpers;
    if (context == null) {
      context = {};
    }
    defaults = {
      currency: currency["default"],
      translations: {},
      urlParams: {}
    };
    context = extend(true, defaults, context);
    helpers = {

      /**
       * Mustache helper to add params from the global context (context.urlParams)
       * to the provided URL. Params are merged and global context takes
       * precedence over existing parameters.
       */
      "url-params": function() {
        return function(text, render) {
          var host, params, ref, url;
          url = (render(text)).trim();
          if (url.length > 0) {
            ref = url.split("?"), host = ref[0], params = ref[1];
            params = extend(true, qs.parse(params), qs.parse(context.urlParams));
            params = qs.stringify(params);
            if (params.length > 0) {
              url = host + "?" + params;
            }
          }
          return url;
        };
      },

      /**
       * Mustache helper to remove HTTP protocol from the start of URLs so they
       * are protocol independant.
       */
      "remove-protocol": function() {
        return function(text, render) {
          return (render(text)).trim().replace(/^https?:/, "");
        };
      },

      /**
       * Mustache helper to format numbers as currency using the currency spec
       * found in the context object, or the default one if none defined.
       */
      "format-currency": function() {
        return function(text, render) {
          var value;
          value = parseFloat(render(text), 10);
          if (isNaN(value)) {
            return "";
          } else {
            return currency.format(value, context.currency);
          }
        };
      },

      /**
       * Mustache helper to translate strings given a translations object in the
       * global context object. If no translation is found, the source text is
       * returned.
       */
      "translate": function() {
        return function(text, render) {
          text = render(text);
          return context.translations[text] || text;
        };
      }
    };
    return extend(true, {}, context, helpers);
  };

  module.exports = addHelpers;

}).call(this);
