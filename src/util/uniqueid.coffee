md5 = require "md5"

cleandfid = (dfid) ->
  if /^\w{32}@[\w_-]+@\w{32}$/.test dfid
    return dfid
  else
    throw new Error "dfid: #{dfid} is not valid."

module.exports =
  clean:
    dfid: cleandfid

  generate:
    dfid: (id, datatype, hashid) ->
      cleandfid "#{hashid}@#{datatype}@#{md5(id)}"

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
