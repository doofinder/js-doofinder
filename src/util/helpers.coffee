extend = require "extend"
qs = require "qs"


defaultCurrency =
  symbol: '€'
  format: '%v%s'
  decimal: ','
  thousand: '.'
  precision: 2


addHelpers = (context) ->
  defaults =
    currency: defaultCurrency
    translations: {}
    urlParams: {}

  context = extend true, defaults, context

  helpers =
    "url-params": ->
      (text, render) ->
        url = (render text).trim()
        if url.length > 0
          [domain, params] = url.split "?"
          params = qs.stringify extend true, (params or {}), (qs.parse context.urlParams)
          url = "#{url}?#{params}" if params.length > 0
        url

    "remove-protocol": ->
      (text, render) ->
        (render text).trim().replace /^https?:/, ""

    "format-currency": ->
      (text, render) ->
        val = parseFloat (render text), 10
        return "" if isNaN val

        neg = val < 0
        val = Math.abs val
        pow = 10 ** context.currency.precision
        val = ((Math.round val * pow) / pow).toFixed context.currency.precision

        bas = (parseInt val, 10).toString()
        mod = if bas.length > 3 then bas.length % 3 else 0

        num = []
        (num.push "#{(bas.substr 0, mod)}#{context.currency.thousand}") if mod > 0
        (num.push ((bas.substr mod).replace /(\d{3})(?=\d)/g, "$1#{context.currency.thousand}"))
        if context.currency.precision > 0
          dec = (val.split ".")[1]
          (num.push "#{context.currency.decimal}#{dec}") if dec?

        num = ((context.currency.format.replace /%s/g, context.currency.symbol).replace /%v/g, num.join "")
        num = "-#{num}" if neg
        num

    "translate": ->
      (text, render) ->
        text = render text
        context.translations[text] or text

  extend true, {}, context, helpers


module.exports = addHelpers
