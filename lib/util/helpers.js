
/*
 * author: @ecoslado
 * 2015 06 30
 */

(function() {
  var addHelpers;

  addHelpers = function(Handlebars, parameters, currency, translations, extraHelpers) {
    var helpers, key, results;
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
        queryParameter: '',
        extraParameters: {}
      };
    }
    helpers = {
      'url-params': function(options) {
        var i, paramsArray, paramsFinal, params_str;
        paramsFinal = options.fn(this);
        if (paramsFinal) {
          paramsArray = [];
          if (parameters.queryParameter) {
            paramsArray.push(parameters.queryParameter + '=' + json.query);
          }
          if (parameters.extraParameters) {
            for (i in parameters.extraParameters) {
              paramsArray.push(i + '=' + parameters.extraParameters[i]);
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
      },
      'remove-protocol': function(options) {
        return options.fn(this).replace(/^https?:/, '');
      },
      'format-currency': function(options) {
        var base, mod, neg, number, power, value;
        value = parseFloat(options.fn(this));
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
      },
      'translate': function(options) {
        var key;
        key = options.fn(this);
        if (translations && key in translations) {
          return translations[key];
        } else {
          return key;
        }
      },
      'eq': function(lvalue, rvalue, options) {
        if (arguments.length < 3) {
          throw new Error('2 parameters are required for helper.');
        }
        if (lvalue !== rvalue) {
          return options.inverse(this);
        } else {
          return options.fn(this);
        }
      },
      'lt': function(lvalue, rvalue, options) {
        if (arguments.length < 3) {
          throw new Error('2 parameters are required for helper.');
        }
        if (lvalue < rvalue) {
          return options.fn(this);
        } else {
          return options.inverse(this);
        }
      },
      'gt': function(lvalue, rvalue, options) {
        if (arguments.length < 3) {
          throw new Error('2 parameters are required for helper.');
        }
        if (lvalue > rvalue) {
          return options.fn(this);
        } else {
          return options.inverse(this);
        }
      },
      'times': function(n, block) {
        var accum, i, j, ref;
        accum = '';
        for (i = j = 1, ref = n; 1 <= ref ? j <= ref : j >= ref; i = 1 <= ref ? ++j : --j) {
          accum += block.fn(i);
        }
        return accum;
      },
      'module': function(a, b, options) {
        return parseInt(a) % parseInt(b);
      }
    };
    for (key in helpers) {
      Handlebars.registerHelper(key, helpers[key]);
    }
    if (extraHelpers) {
      results = [];
      for (key in extraHelpers) {
        results.push(Handlebars.registerHelper(key, extraHelpers[key]));
      }
      return results;
    }
  };

  module.exports = {
    addHelpers: addHelpers
  };

}).call(this);
