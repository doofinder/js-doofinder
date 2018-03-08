md5 = require "md5"
errors = require "./errors"

isValidDoofinderId = (text) ->
  (splitDoofinderId text) isnt text

generateDoofinderId = (id, datatype, hashid) ->
  id = md5 "#{id}"
  dfid = "#{hashid}@#{datatype}@#{id}"
  if isValidDoofinderId dfid
    dfid
  else
    throw errors.error "can't generate a dfid: invalid input data."

splitDoofinderId = (text) ->
  m = text.match /^([0-9a-f]{32})@([\w-]+)@([0-9a-f]{32})$/i
  if m?
    hashid: m[1]
    datatype: m[2]
    id: m[3]
  else
    text

module.exports =
  dfid:
    isValid: isValidDoofinderId
    create: generateDoofinderId
    split: splitDoofinderId

  generate:
    easy: (length = 8) ->
      id = ""
      id += Math.random().toString(36).substr(2) while id.length < length
      id.substr 0, length

    hash: ->
      md5 [
        new Date().getTime(),
        String(Math.floor(Math.random() * 10000))
      ].join ""

    browserHash: ->
      md5 [
        navigator.userAgent,
        navigator.language,
        window.location.host,
        new Date().getTime(),
        String(Math.floor(Math.random() * 10000))
      ].join ""
