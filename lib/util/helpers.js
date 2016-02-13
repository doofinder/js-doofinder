
/*
 * author: @ecoslado
 * 2015 09 30
 */

(function() {
  var $, addHelpers;

  $ = require("./jquery");

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
        return function(url, render) {
          var i, paramsArray, paramsFinal, params_str;
          paramsFinal = url;
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
        return function(url, render) {
          return url.replace(/^https?:/, '');
        };
      },
      'format-currency': function() {
        return function(price, render) {
          var base, mod, neg, number, power, value;
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
          var key;
          key = render(text);
          if (translations && key in translations) {
            return translations[key];
          } else {
            return key;
          }
        };
      },
      'eq': function() {
        return function(lvalue, rvalue, options) {
          if (arguments.length < 3) {
            throw new Error('2 parameters are required for helper.');
          }
          if (lvalue !== rvalue) {
            return options.inverse(this);
          } else {
            return options.fn(this);
          }
        };
      },
      'lt': function() {
        return function(lvalue, rvalue, options) {
          if (arguments.length < 3) {
            throw new Error('2 parameters are required for helper.');
          }
          if (lvalue < rvalue) {
            return options.fn(this);
          } else {
            return options.inverse(this);
          }
        };
      },
      'gt': function() {
        return function(lvalue, rvalue, options) {
          if (arguments.length < 3) {
            throw new Error('2 parameters are required for helper.');
          }
          if (lvalue > rvalue) {
            return options.fn(this);
          } else {
            return options.inverse(this);
          }
        };
      }
    };
    $.extend(helpers, extraHelpers);
    return $.extend(context, helpers);
  };

  module.exports = {
    addHelpers: addHelpers
  };

}).call(this);
