(function() {
  var defaultCurrency, formatCurrency;

  defaultCurrency = {
    symbol: '€',
    format: '%v%s',
    decimal: ',',
    thousand: '.',
    precision: 2
  };

  formatCurrency = function(value, currency) {
    var bas, dec, mod, neg, num, pow, val;
    if (currency == null) {
      currency = defaultCurrency;
    }
    neg = value < 0;
    val = Math.abs(value);
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
      if ((parseInt(dec, 10)) > 0) {
        num.push("" + currency.decimal + dec);
      }
    }
    num = (currency.format.replace(/%s/g, currency.symbol)).replace(/%v/g, num.join(""));
    if (neg) {
      num = "-" + num;
    }
    return num;
  };

  module.exports = {
    "default": defaultCurrency,
    format: formatCurrency
  };

}).call(this);
