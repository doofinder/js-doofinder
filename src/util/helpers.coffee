extend = require "extend"
qs = require "qs"
currency = require "./currency"


addHelpers = (context = {}) ->
  defaults =
    currency: currency.default
    translations: {}
    urlParams: {}

  context = extend true, defaults, context

  helpers =
    ###*
     * Mustache helper to add params from the global context (context.urlParams)
     * to the provided URL. Params are merged and global context takes
     * precedence over existing parameters.
    ###
    "url-params": ->
      (text, render) ->
        url = (render text).trim()
        if url.length > 0
          [host, params] = url.split "?"
          params = extend true, (qs.parse params), (qs.parse context.urlParams)
          params = qs.stringify params
          url = "#{host}?#{params}" if params.length > 0
        url

    ###*
     * Mustache helper to remove HTTP protocol from the start of URLs so they
     * are protocol independant.
    ###
    "remove-protocol": ->
      (text, render) ->
        (render text).trim().replace /^https?:/, ""

    ###*
     * Mustache helper to format numbers as currency using the currency spec
     * found in the context object, or the default one if none defined.
    ###
    "format-currency": ->
      (text, render) ->
        value = parseFloat (render text), 10
        if isNaN value then "" else (currency.format value, context.currency)

    ###*
     * Mustache helper to translate strings given a translations object in the
     * global context object. If no translation is found, the source text is
     * returned.
    ###
    "translate": ->
      (text, render) ->
        text = render text
        context.translations[text] or text

  extend true, {}, context, helpers


module.exports = addHelpers
