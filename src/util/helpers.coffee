###
# author: @ecoslado
# 2015 09 30
###

extend = require "extend"

module.exports = (context, parameters = {}, currency = null, translations = {}) ->
  unless currency
    currency =
      symbol: '&euro;'
      format: '%v%s'
      decimal: ','
      thousand: '.'
      precision: 2

  helpers =
    'url-params': () ->
      (text, render) ->
        url = (render text).trim()
        if url.length > 0
          params = []
          for key of parameters
            params.push "#{key}=#{parameters[key]}"
          if params.length > 0
            params = params.join "&"
            glue = if url.match /\?/ then "&" else "?"
            url = "#{url}#{glue}#{params}"
        url

    'remove-protocol': () ->
      (text, render) ->
        url = render(text)
        url.replace /^https?:/, ''

    'format-currency': () ->
      (text, render) ->
        price = render(text)
        value = parseFloat(price)
        if !value and value != 0
          return ''
        power = 10 ** currency.precision
        number = (Math.round(value * power) / power).toFixed(currency.precision)
        neg = if number < 0 then '-' else ''
        base = '' + parseInt(Math.abs(number or 0).toFixed(currency.precision), 10)
        mod = if base.length > 3 then base.length % 3 else 0
        number = neg + (if mod then base.substr(0, mod) + currency.thousand else '') + base.substr(mod).replace(/(\d{3})(?=\d)/g, '$1' + currency.thousand) + (if currency.precision then currency.decimal + Math.abs(number).toFixed(currency.precision).split('.')[1] else '')
        currency.format.replace(/%s/g, currency.symbol).replace /%v/g, number

    'translate': () ->
      (text, render) ->
        text = render text
        translations[text] or text

  extend context, helpers
