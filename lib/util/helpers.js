
/*
 * author: @ecoslado
 * 2015 09 30
 */

(function() {
  var extend;

  extend = require("extend");

  module.exports = function(context, parameters, currency, translations) {
    var helpers;
    if (parameters == null) {
      parameters = {};
    }
    if (currency == null) {
      currency = null;
    }
    if (translations == null) {
      translations = {};
    }
    if (!currency) {
      currency = {
        symbol: '&euro;',
        format: '%v%s',
        decimal: ',',
        thousand: '.',
        precision: 2
      };
    }
    helpers = {
      'url-params': function() {
        return function(text, render) {
          var glue, key, params, querystring, value;
          querystring = render(text);
          if (querystring) {
            params = [];
            for (key in parameters) {
              value = parameters[key];
              params.push(key + "=" + value);
              if (params.length !== 0) {
                params = params.join("&");
                glue = querystring.match(/\?/) ? "&" : "?";
              } else {
                querystring = "" + querystring + glue + params;
              }
            }
          }
          return querystring;
        };
      }
    };
    ({
      'remove-protocol': function() {
        return function(text, render) {
          var url;
          url = render(text);
          return url.replace(/^https?:/, '');
        };
      },
      'format-currency': function() {
        return function(text, render) {
          var base, mod, neg, number, power, price, value;
          price = render(text);
          value = parseFloat(price);
          if (!value && value !== 0) {
            return '';
          }
          power = Math.pow(10, currency.precision);
          number = (Math.round(value * power) / power).toFixed(currency.precision);
          neg = number < 0 ? '-' : '';
          base = '' + parseInt(Math.abs(number || 0).toFixed(currency.precision), 10);
          mod = base.length > 3 ? base.length % 3 : 0;
          number = neg + (mod ? base.substr(0, mod) + currency.thousand : '') + base.substr(mod).replace(/(\d{3})(?=\d)/g, '$1' + currency.thousand) + (currency.precision ? currency.decimal + Math.abs(number).toFixed(currency.precision).split('.')[1] : '');
          return currency.format.replace(/%s/g, currency.symbol).replace(/%v/g, number);
        };
      },
      'translate': function() {
        return function(text, render) {
          text = render(text);
          return translations[text] || text;
        };
      }
    });
    return extend(context, helpers);
  };

}).call(this);
