###
# author: @ecoslado
# 2015 06 30
###

addHelpers = (Handlebars, parameters, currency, extraFunctions, language, customStrings) ->
  
  if !currency
    currency =
      symbol: '&euro;'
      format: '%v%s'
      decimal: ','
      thousand: '.'
      precision: 2
  
  if !parameters
    parameters =
      queryParameter: ''
      extraParameters: {}
  
  
  helpers = 
    
    urlParams: (options) ->
      paramsFinal = options.fn(this)
      if paramsFinal
        paramsArray = []
        # if addQueryParameter, add it to the list
        if parameters.queryParameter
          paramsArray.push parameters.queryParameter + '=' + json.query
        # if addParameters, add them to the list
        if parameters.extraParameters
          for i of parameters.extraParameters
            paramsArray.push i + '=' + parameters.extraParameters[i]
        if paramsArray.length
          params_str = paramsArray.join('&')
          if paramsFinal.match(/\?/)
            paramsFinal = paramsFinal + '&' + params_str
          else
            paramsFinal = paramsFinal + '?' + params_str
      paramsFinal
    
    removeProtocol: (options) ->
      options.fn(this).replace /^https?:/, ''
    
    formatCurrency: (options) ->
      value = parseFloat(options.fn(this))
      console.log parseFloat(options.fn(this))
      if !value and value != 0
        return ''
      power = 10 ** currency.precision
      number = (Math.round(value * power) / power).toFixed(currency.precision)
      neg = if number < 0 then '-' else ''
      base = '' + parseInt(Math.abs(number or 0).toFixed(currency.precision), 10)
      mod = if base.length > 3 then base.length % 3 else 0
      number = neg + (if mod then base.substr(0, mod) + currency.thousand else '') + base.substr(mod).replace(/(\d{3})(?=\d)/g, '$1' + currency.thousand) + (if currency.precision then currency.decimal + Math.abs(number).toFixed(currency.precision).split('.')[1] else '')
      currency.format.replace(/%s/g, currency.symbol).replace /%v/g, number
    
    translate: (options) ->
      key = options.fn(this)
      if customStrings and key in customStrings
        customStrings[key]
      else if key in translations and language in translations[key]
        translations[key][language]
      else
        translations[key]['en']
  
  for key of helpers
    Handlebars.registerHelper key, hbHelpers[key]
  
  if extraFunctions
    for key of extraFunctions
      Handlebars.registerHelper key, extraFunctions[key]

module.exports = addHelpers: addHelpers
