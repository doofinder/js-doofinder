Thing = require "./thing"
errors = require "./errors"

defaultCurrency =
  symbol: '€'
  format: '%v%s'
  decimal: ','
  thousand: '.'
  precision: 2

###*
 * Formats a value following the provided currency specification and returns
 * it as a String.
 *
 * If no specification is passed, EUR currency is used by default.
 *
 * @param  {Number} value
 * @param  {Object} currency An object that contains a currency specification.
 *                           Attributes of the specification are:
 *                           {
 *                             symbol: Currency symbol, like "€".
 *                             format: Template, %s is replaced by the symbol
 *                                     and %v is replaced by the value.
 *                             decimal: Character used to separate decimals.
 *                             thousand: Character used to separate thousands.
 *                             precision: Number of decimals.
 *                           }
 * @return {String}          Formatted value.
###
formatCurrency = (value, currency = defaultCurrency) ->
  unless Thing.is.number value
    throw errors.error "value is not a number!"

  neg = value < 0
  val = Math.abs value

  pow = 10 ** currency.precision
  val = ((Math.round val * pow) / pow).toFixed currency.precision

  bas = (parseInt val, 10).toString()
  mod = if bas.length > 3 then bas.length % 3 else 0

  num = []
  (num.push "#{(bas.substr 0, mod)}#{currency.thousand}") if mod > 0
  (num.push ((bas.substr mod).replace /(\d{3})(?=\d)/g, "$1#{currency.thousand}"))
  if currency.precision > 0
    dec = (val.split ".")[1]
    (num.push "#{currency.decimal}#{dec}") if (parseInt dec, 10) > 0

  num = ((currency.format.replace /%s/g, currency.symbol).replace /%v/g, num.join "")
  num = "-#{num}" if neg
  num

module.exports =
  default: defaultCurrency
  format: formatCurrency
