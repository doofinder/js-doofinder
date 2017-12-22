module.exports =
  ###*
   * Converts text in camel case to dash case
   * @param  {String} text Text in camelCase
   * @return {String}      Text converted to dash-case
  ###
  camel2dash: (text) ->
    text.replace /[A-Z]/g, ((m) -> "-" + m.toLowerCase())

  ###*
   * Converts text in dash case to camel case
   * @param  {String} text Text in dash-case
   * @return {String}      Text converted to camelCase
  ###
  dash2camel: (text) ->
    text = text.replace /([-_])([^-_])/g, ((m, p1, p2) -> p2.toUpperCase())
    text.replace /[-_]/g, ""
