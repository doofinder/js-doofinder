###
# author: @ecoslado
# 2015 06 30
###

addHelpers = (Handlebars, parameters, currency, translations, extraHelpers) ->
  
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
    
    'url-params': (options) ->
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
    
    'remove-protocol': (options) ->
      options.fn(this).replace /^https?:/, ''
    
    'format-currency': (options) ->
      value = parseFloat(options.fn(this))
      if !value and value != 0
        return ''
      power = 10 ** currency.precision
      number = (Math.round(value * power) / power).toFixed(currency.precision)
      neg = if number < 0 then '-' else ''
      base = '' + parseInt(Math.abs(number or 0).toFixed(currency.precision), 10)
      mod = if base.length > 3 then base.length % 3 else 0
      number = neg + (if mod then base.substr(0, mod) + currency.thousand else '') + base.substr(mod).replace(/(\d{3})(?=\d)/g, '$1' + currency.thousand) + (if currency.precision then currency.decimal + Math.abs(number).toFixed(currency.precision).split('.')[1] else '')
      currency.format.replace(/%s/g, currency.symbol).replace /%v/g, number
    
    'translate': (options) ->
      key = options.fn(this)
      if customStrings and key in customStrings
        customStrings[key]
      else if key in translations and language in translations[key]
        translations[key][language]
      else
        translations[key]['en']

    'eq': (lvalue, rvalue, options) ->
      if arguments.length < 3
        throw new Error '2 parameters are required for helper.'
      if lvalue != rvalue
        return options.inverse(this)
      else
        return options.fn(this)
    
    'lt': (lvalue, rvalue, options) ->
      if arguments.length < 3
        throw new Error '2 parameters are required for helper.'
      if lvalue < rvalue
        return options.fn(this)
      else
        return options.inverse(this)
    
    'gt': (lvalue, rvalue, options) ->
      if arguments.length < 3
        throw new Error '2 parameters are required for helper.'
      if lvalue > rvalue
        return options.fn(this)
      else
        return options.inverse(this)

    'times': (n, block) ->
      accum = ''
      for i in [1..n]
          accum += block.fn(i)
      return accum

    'module': (a, b, options) ->
      return parseInt(a) % parseInt(b)

  
  for key of helpers
    Handlebars.registerHelper key, helpers[key]
  
  if extraHelpers
    for key of extraHelpers
      Handlebars.registerHelper key, extraHelpers[key]

module.exports = addHelpers: addHelpers
