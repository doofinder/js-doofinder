defaultCurrency =
  symbol: '€'
  format: '%v%s'
  decimal: ','
  thousand: '.'
  precision: 2

formatCurrency = (value, currency = defaultCurrency) ->
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
