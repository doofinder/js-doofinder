(function() {
  var addHelpers, defaultCurrency, extend, qs;

  extend = require("extend");

  qs = require("qs");

  defaultCurrency = {
    symbol: '€',
    format: '%v%s',
    decimal: ',',
    thousand: '.',
    precision: 2
  };

  addHelpers = function(context) {
    var defaults, helpers;
    defaults = {
      currency: defaultCurrency,
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
          var bas, dec, mod, neg, num, pow, val;
          val = parseFloat(render(text), 10);
          if (isNaN(val)) {
            return "";
          }
          neg = val < 0;
          val = Math.abs(val);
          pow = Math.pow(10, context.currency.precision);
          val = ((Math.round(val * pow)) / pow).toFixed(context.currency.precision);
          bas = (parseInt(val, 10)).toString();
          mod = bas.length > 3 ? bas.length % 3 : 0;
          num = [];
          if (mod > 0) {
            num.push("" + (bas.substr(0, mod)) + context.currency.thousand);
          }
          num.push((bas.substr(mod)).replace(/(\d{3})(?=\d)/g, "$1" + context.currency.thousand));
          if (context.currency.precision > 0) {
            dec = (val.split("."))[1];
            if (dec != null) {
              num.push("" + context.currency.decimal + dec);
            }
          }
          num = (context.currency.format.replace(/%s/g, context.currency.symbol)).replace(/%v/g, num.join(""));
          if (neg) {
            num = "-" + num;
          }
          return num;
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
