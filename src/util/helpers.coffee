extend = require "extend"
qs = require "qs"
currency = require "./currency"


addHelpers = (context) ->
  defaults =
    currency: currency.default
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
        value = parseFloat (render text), 10
        if isNaN value then "" else (currency.format value, context.currency)

    "translate": ->
      (text, render) ->
        text = render text
        context.translations[text] or text

  extend true, {}, context, helpers


module.exports = addHelpers
