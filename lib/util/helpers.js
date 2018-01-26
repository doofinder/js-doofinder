(function() {
  var extend, formatNumber, qs, translate;

  extend = require("extend");

  qs = require("qs");

  translate = (require("./text")).translate;


  /**
   * Formats a value following the provided currency specification and returns
   * it as a String.
   *
   * If no specification is passed, EUR currency is used by default.
   *
   * @param  {Number} value
   * @param  {Object} currency An object that contains a currency specification.
   *                           Attributes of the specification are:
   *                           {
   *                             symbol:    Required. A symbol, like "€".
   *                             format:    Required. Template.
   *                                          %s is replaced by the symbol.
   *                                          %v is replaced by the value.
   *                             decimal:   Optional. Decimal separator.
   *                             thousand:  Optional. Thousands separator.
   *                             precision: Optional. Number of decimals.
   *                                          2 by default.
   *                           }
   * @return {String}          Formatted value.
   */

  formatNumber = function(value, spec) {
    var base, dec, decimal, mod, neg, num, number, power, precision, thousand;
    if (value == null) {
      return "";
    }
    neg = value < 0;
    precision = spec.precision != null ? spec.precision : 2;
    decimal = spec.decimal || ".";
    thousand = spec.thousand || "";
    power = Math.pow(10, precision);
    number = ((Math.round(value * power)) / power).toFixed(precision);
    base = "" + parseInt((Math.abs(number || 0)).toFixed(precision), 10);
    mod = base.length > 3 ? base.length % 3 : 0;
    num = [];
    if (mod > 0) {
      num.push("" + (base.substr(0, mod)) + thousand);
    }
    num.push((base.substr(mod)).replace(/(\d{3})(?=\d)/g, "$1" + thousand));
    if (precision > 0) {
      dec = (number.split("."))[1];
      if ((parseInt(dec, 10)) > 0) {
        num.push("" + decimal + dec);
      }
    }
    num = (spec.format.replace(/%s/g, spec.symbol)).replace(/%v/g, num.join(""));
    if (neg) {
      num = "-" + num;
    }
    return num;
  };

  module.exports = {
    fn: {
      formatNumber: formatNumber
    },
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
    },

    /**
     * Adds `url-params` Mustache helper to the provided context.
     *
     * This function uses external methods to dynamically retrieve stuff it needs
     * to work.
     *
     * @param {Object}   context         Mustache template context.
     * @param {Function} getUrlParamsFn  Retrieves an object with parameters to
     *                                   add to the URL being rendered. Each key
     *                                   is a parameter name and the value is the
     *                                   parameter value.
     *
     * Example obtaining dynamic values for parameters
     *
     * controller = new ...;
     * ...
     * addUrlParamsHelper(context, function(){
     *   return {
     *     query: controller.query
     *   };
     * });
     */
    addUrlParamsHelper: function(context, getUrlParamsFn) {

      /**
       * Mustache helper to add params from the global context (context.urlParams)
       * to the provided URL. Params are merged and global context takes
       * precedence over existing parameters.
       */
      return extend(true, context, {
        "url-params": function() {
          return function(text, render) {
            var host, params, ref, url, urlParams;
            url = (render(text)).trim();
            if (url.length > 0) {
              ref = url.split("?"), host = ref[0], params = ref[1];
              urlParams = extend(true, (typeof getUrlParamsFn === "function" ? getUrlParamsFn() : void 0) || {});
              params = qs.stringify(extend(true, qs.parse(params), urlParams));
              if (params.length > 0) {
                url = host + "?" + params;
              }
            }
            return url;
          };
        }
      });
    },
    addRemoveProtocolHelper: function(context) {

      /**
       * Mustache helper to remove HTTP protocol from the start of URLs so they
       * are protocol independant.
       */
      return extend(true, context, {
        "remove-protocol": function() {
          return function(text, render) {
            return (render(text)).trim().replace(/^https?:/g, "");
          };
        }
      });
    },
    addFormatCurrencyHelper: function(context, currency) {

      /**
       * Mustache helper to format numbers as currency using the currency spec
       * provided.
       */
      return extend(true, context, {
        "format-currency": function() {
          return function(text, render) {
            var value;
            value = parseFloat(render(text), 10);
            if (isNaN(value)) {
              return "";
            } else {
              return formatNumber(value, currency);
            }
          };
        }
      });
    }
  };

}).call(this);
