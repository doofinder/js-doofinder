
/*
 * author: @ecoslado
 * 2015 09 30
 */

(function() {
  var addHelpers, extend;

  extend = require("extend");

  addHelpers = function(context, parameters, currency, translations, extraHelpers) {
    var helpers;
    if (!currency) {
      currency = {
        symbol: '&euro;',
        format: '%v%s',
        decimal: ',',
        thousand: '.',
        precision: 2
      };
    }
    if (!parameters) {
      parameters = {
        queryParam: '',
        extraParams: {}
      };
    }
    helpers = {
      'url-params': function() {
        return function(text, render) {
          var i, paramsArray, paramsFinal, params_str;
          paramsFinal = render(text);
          if (paramsFinal) {
            paramsArray = [];
            if (parameters.queryParam) {
              paramsArray.push(parameters.queryParam + '=' + context.query);
            }
            if (parameters.extraParams) {
              for (i in parameters.extraParams) {
                paramsArray.push(i + '=' + parameters.extraParams[i]);
              }
            }
            if (paramsArray.length) {
              params_str = paramsArray.join('&');
              if (paramsFinal.match(/\?/)) {
                paramsFinal = paramsFinal + '&' + params_str;
              } else {
                paramsFinal = paramsFinal + '?' + params_str;
              }
            }
          }
          return paramsFinal;
        };
      },
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
          var key, keys;
          key = render(text);
          keys = Object.keys(translations);
          if (translations && keys.indexOf(key) > -1) {
            return translations[key];
          } else {
            return key;
          }
        };
      }
    };
    extend(helpers, extraHelpers);
    return extend(context, helpers);
  };

  module.exports = {
    addHelpers: addHelpers
  };

}).call(this);
