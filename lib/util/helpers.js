(function() {
  var defaultCurrency, extend,
    hasProp = {}.hasOwnProperty;

  extend = require("extend");

  defaultCurrency = {
    symbol: '€',
    format: '%v%s',
    decimal: ',',
    thousand: '.',
    precision: 2
  };

  module.exports = function(context) {
    var helpers;
    helpers = {
      "url-params": function() {
        var parameters;
        parameters = context.urlParams || {};
        return function(text, render) {
          var glue, key, params, url;
          url = (render(text)).trim();
          if (url.length > 0) {
            params = [];
            for (key in parameters) {
              if (!hasProp.call(parameters, key)) continue;
              params.push(key + "=" + parameters[key]);
            }
            if (params.length > 0) {
              params = params.join("&");
              glue = url.match(/\?/) ? "&" : "?";
              url = "" + url + glue + params;
            }
          }
          return url;
        };
      },
      "remove-protocol": function() {
        return function(text, render) {
          return (render(text)).replace(/^https?:/, "");
        };
      },
      "format-currency": function() {
        var currency;
        currency = context.currency || defaultCurrency;
        return function(text, render) {
          var bas, dec, mod, neg, num, pow, val;
          val = parseFloat(render(text), 10);
          if (isNaN(val)) {
            return "";
          }
          neg = val < 0;
          val = Math.abs(val);
          pow = Math.pow(10, currency.precision);
          val = ((Math.round(val * pow)) / pow).toFixed(currency.precision);
          bas = (parseInt(val, 10)).toString();
          mod = bas.length > 3 ? bas.length % 3 : 0;
          num = [];
          if (mod > 0) {
            num.push("" + (bas.substr(0, mod)) + currency.thousand);
          }
          num.push((bas.substr(mod)).replace(/(\d{3})(?=\d)/g, "$1" + currency.thousand));
          if (currency.precision > 0) {
            dec = (val.split("."))[1];
            if (dec != null) {
              num.push("" + currency.decimal + dec);
            }
          }
          num = (currency.format.replace(/%s/g, currency.symbol)).replace(/%v/g, num.join(""));
          if (neg) {
            num = "-" + num;
          }
          return num;
        };
      },
      "translate": function() {
        var translations;
        translations = context.translations || {};
        return function(text, render) {
          text = render(text);
          return translations[text] || text;
        };
      }
    };
    return extend(true, {}, context, helpers);
  };

}).call(this);
