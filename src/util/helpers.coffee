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
        querystring = render text
        if querystring
          params = []
          for key, value of parameters
            params.push "#{key}=#{value}"
          params = params.join "&"
          glue = if querystring.match /\?/ then "&" else "?"
          querystring = "#{querystring}#{glue}#{params}"
        querystring

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
        key = render(text)
        keys = Object.keys(translations)
        if translations and keys.indexOf(key) > -1
          return translations[key]
        else
          return key

  extend context, helpers
