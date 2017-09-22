extend = require "extend"


defaultCurrency =
  symbol: '€'
  format: '%v%s'
  decimal: ','
  thousand: '.'
  precision: 2


module.exports = (context) ->
  helpers =
    "url-params": ->
      parameters = context.urlParams or {}

      (text, render) ->
        url = (render text).trim()
        if url.length > 0
          params = []
          for own key of parameters
            params.push "#{key}=#{parameters[key]}"
          if params.length > 0
            params = params.join "&"
            glue = if url.match /\?/ then "&" else "?"
            url = "#{url}#{glue}#{params}"
        url

    "remove-protocol": ->
      (text, render) ->
        (render text).replace /^https?:/, ""

    "format-currency": ->
      currency = context.currency or defaultCurrency

      (text, render) ->
        val = parseFloat (render text), 10
        return "" if isNaN val

        neg = val < 0
        val = Math.abs val
        pow = 10 ** currency.precision
        val = ((Math.round val * pow) / pow).toFixed(currency.precision)

        bas = (parseInt val, 10).toString()
        mod = if bas.length > 3 then bas.length % 3 else 0

        num = []
        (num.push "#{(bas.substr 0, mod)}#{currency.thousand}") if mod > 0
        (num.push ((bas.substr mod).replace /(\d{3})(?=\d)/g, "$1#{currency.thousand}"))
        if currency.precision > 0
          dec = (val.split ".")[1]
          (num.push "#{currency.decimal}#{dec}") if dec?

        num = ((currency.format.replace /%s/g, currency.symbol).replace /%v/g, num.join "")
        num = "-#{num}" if neg

        num

    "translate": ->
      translations = context.translations or {}

      (text, render) ->
        text = render text
        translations[text] or text

  extend true, {}, context, helpers
