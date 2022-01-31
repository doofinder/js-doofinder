###*
 * Converts text in camel case to dash case
 * @param  {String} text Text in camelCase
 * @return {String}      Text converted to dash-case
###
camel2dash = (text) ->
  text.replace /[A-Z]/g, ((m) -> "-" + m.toLowerCase())

###*
 * Converts text in dash case to camel case
 * @param  {String} text Text in dash-case
 * @return {String}      Text converted to camelCase
###
dash2camel = (text) ->
  text = text.replace /([-_])([^-_])/g, ((m, p1, p2) -> p2.toUpperCase())
  text.replace /[-_]/g, ""

dash2class = (text) ->
  (dash2camel text).replace(/^./, (m) -> m.toUpperCase())

ucwords = (text) ->
  text.replace /(^|\s)\S/g, (c) -> c.toUpperCase()

ucfirst = (text) ->
  text.replace /^\S/g, (c) -> c.toUpperCase()

toSnake = (text) ->
  text.replace /\s+/g, '_'

translate = (text, translations) ->
  translations[text] or text

myUnescape = (text) ->
  unescaped_text = decodeURIComponent text
  while unescaped_text != text
    text = unescaped_text
    unescaped_text = decodeURIComponent text
  unescaped_text

cleanXSS = (text) ->
  text = myUnescape text
  doc = (new DOMParser()).parseFromString text, "text/html"
  doc.body.textContent || ""

module.exports =
  camel2dash: camel2dash
  dash2camel: dash2camel
  dash2class: dash2class
  ucwords: ucwords
  ucfirst: ucfirst
  toSnake: toSnake
  translate: translate
  unescape: myUnescape
  cleanXSS: cleanXSS
