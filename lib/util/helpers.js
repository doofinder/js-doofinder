(function() {
  var addHelpers, currency, extend, qs;

  extend = require("extend");

  qs = require("qs");

  currency = require("./currency");

  addHelpers = function(context) {
    var defaults, helpers;
    defaults = {
      currency: currency["default"],
      translations: {},
      urlParams: {}
    };
    context = extend(true, defaults, context);
    helpers = {
      "url-params": function() {
        return function(text, render) {
          var domain, params, ref, url;
          url = (render(text)).trim();
          if (url.length > 0) {
            ref = url.split("?"), domain = ref[0], params = ref[1];
            params = qs.stringify(extend(true, params || {}, qs.parse(context.urlParams)));
            if (params.length > 0) {
              url = url + "?" + params;
            }
          }
          return url;
        };
      },
      "remove-protocol": function() {
        return function(text, render) {
          return (render(text)).trim().replace(/^https?:/, "");
        };
      },
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
