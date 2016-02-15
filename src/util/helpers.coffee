###
# author: @ecoslado
# 2015 09 30
###

$ = require "./jquery"

addHelpers = (context, parameters, currency, translations, extraHelpers) ->
  
  if !currency
    currency =
      symbol: '&euro;'
      format: '%v%s'
      decimal: ','
      thousand: '.'
      precision: 2
  
  if !parameters
    parameters =
      queryParam: ''
      extraParams: {}
  
  
  helpers = 
    'url-params': () ->
      (text, render) ->
        paramsFinal = render(text)

        if paramsFinal
          paramsArray = []
          # if queryParam, add it to the list
          if parameters.queryParam
            paramsArray.push parameters.queryParam + '=' + context.query
          # if addParameters, add them to the list
          if parameters.extraParams
            for i of parameters.extraParams
              paramsArray.push i + '=' + parameters.extraParams[i]
          if paramsArray.length
            params_str = paramsArray.join('&')
            if paramsFinal.match(/\?/)
              paramsFinal = paramsFinal + '&' + params_str
            else
              paramsFinal = paramsFinal + '?' + params_str
        paramsFinal
    
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
        if translations and key of translations
          return translations[key]
        else
          return key


  $.extend helpers,
    extraHelpers
  
  $.extend context,
    helpers


module.exports = addHelpers: addHelpers
