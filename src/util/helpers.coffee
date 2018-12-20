qs = require "qs"
merge = require "./merge"

translate = (require "./text").translate

###*
 * Formats a value following the provided currency specification and returns
 * it as a String.
 *
 * If no specification is passed, EUR currency is used by default.
 *
 * @param  {Number} value
 * @param  {Object} currency An object that contains a currency specification.
 *                           Attributes of the specification are:
 *                           {
 *                             symbol:        Required. A symbol, like "€".
 *                             format:        Required. Template.
 *                                              %s is replaced by the symbol.
 *                                              %v is replaced by the value.
 *                             decimal:       Optional. Decimal separator.
 *                             thousand:      Optional. Thousands separator.
 *                             precision:     Optional. Number of decimals.
 *                                              2 by default.
 *                             forceDecimals: Optional. Forces decimals for
 *                                              integer values. `true` by
 *                                              default.
 *                           }
 * @return {String}          Formatted value.
###
formatNumber = (value, spec) ->
  return "" unless value?

  spec.forceDecimals ?= true

  neg = value < 0

  precision = if spec.precision? then spec.precision else 2
  decimal = spec.decimal or "."
  thousand = spec.thousand or ""

  power = 10 ** precision
  number = ((Math.round value * power) / power).toFixed precision
  base = "" + parseInt ((Math.abs (number or 0)).toFixed precision), 10
  mod = if base.length > 3 then base.length % 3 else 0

  num = []
  (num.push "#{base.substr 0, mod}#{thousand}") if mod > 0
  (num.push ((base.substr mod).replace /(\d{3})(?=\d)/g, "$1#{thousand}"))
  if precision > 0
    dec = (number.split ".")[1]
    if spec.forceDecimals or (parseInt dec, 10) > 0
      num.push "#{decimal}#{dec}"

  num = ((spec.format.replace /%s/g, spec.symbol).replace /%v/g, num.join "")
  num = "-#{num}" if neg
  num


###*
 * Function that decodes HTML entities from a string.
 *
 * All credit for this answer in StackOverflow:
 *
 * https://stackoverflow.com/a/9609450
 *
 * @return {String}
###
decodeEntities = (->
  element = document.createElement "div"
  (str) ->
    if str and typeof str is "string"
      str = str.replace /<script[^>]*>([\S\s]*?)<\/script>/gmi, ""
      str = str.replace /<\/?\w(?:[^"'>]|"[^"]*"|'[^']*')*>/gmi, ""
      element.innerHTML = str
      str = element.textContent
      element.textContent = ""
    str
)()


###*
 * Adds parameters to a URL
 *
 * @param  {String} url       Source URL.
 * @param  {Object} urlParams Object representing parameters and values.
 * @return {String}
###
addUrlParams = (url, urlParams = {}) ->
  if url.length and (Object.keys urlParams).length
    [host, params] = url.split "?"
    params = qs.stringify (merge (qs.parse params), urlParams)
    "#{host}?#{params}"
  else
    url


###*
 * Removes protocol from a URL.
 *
 * @param  {String} url Source URL.
 * @return {String}
###
removeProtocol = (url) ->
  url.trim().replace /^https?:/g, ""


module.exports =
  fn:
    formatNumber: formatNumber
    addUrlParams: addUrlParams
    removeProtocol: removeProtocol
    decodeEntities: decodeEntities

  addTranslateHelper: (context, translations = {}) ->
    ###*
     * Mustache helper to translate strings given a translations object in the
     * global context object. If no translation is found, the source text is
     * returned.
    ###
    merge context, "translate": ->
      (text, render) ->
        render (translate text, translations)

  ###*
   * Adds `url-params` Mustache helper to the provided context.
   *
   * This function uses external methods to dynamically retrieve stuff it needs
   * to work.
   *
   * @param {Object}   context         Mustache template context.
   * @param {Function} getUrlParamsFn  Retrieves an object with parameters to
   *                                   add to the URL being rendered. Each key
   *                                   is a parameter name and the value is the
   *                                   parameter value.
   *
   * Example obtaining dynamic values for parameters
   *
   * controller = new ...;
   * ...
   * addUrlParamsHelper(context, function(){
   *   return {
   *     query: controller.query
   *   };
   * });
  ###
  addUrlParamsHelper: (context, getUrlParamsFn) ->
    ###*
     * Mustache helper to add params from the global context (context.urlParams)
     * to the provided URL. Params are merged and global context takes
     * precedence over existing parameters.
    ###
    merge context, "url-params": ->
      (text, render) ->
        url = (render text).trim()
        params = (getUrlParamsFn?() or {})
        addUrlParams url, params

  addRemoveProtocolHelper: (context) ->
    ###*
     * Mustache helper to remove HTTP protocol from the start of URLs so they
     * are protocol independant.
    ###
    merge context, "remove-protocol": ->
      (text, render) ->
        removeProtocol (render text)

  addFormatCurrencyHelper: (context, currency) ->
    ###*
     * Mustache helper to format numbers as currency using the currency spec
     * provided.
    ###
    merge context, "format-currency": ->
      (text, render) ->
        value = parseFloat (render text), 10
        if isNaN value then "" else (formatNumber value, currency)
