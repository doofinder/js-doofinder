jsdom = require('jsdom').jsdom

actualDOM = null
documentRef = null
exposedProperties = ['window', 'navigator', 'document']


create = (domString = '') ->
  actualDOM = domString
  global.document = jsdom actualDOM
  global.window = document.defaultView

  for property of document.defaultView
    unless global[property]?
      exposedProperties.push property
      global[property] = document.defaultView[property]

  global.navigator =
    userAgent: 'node.js'
  documentRef = document


destroy = (clearRequireCache) ->
  clearCache = if clearRequireCache? then clearRequireCache else true
  if global.window? then global.window.close()

  documentRef = undefined
  for property in exposedProperties
    delete global[property]

  if clearCache
    for property of require.cache
      if property.indexOf('require') isnt -1
        delete require.cache[property]


clear = () ->
  destroy()
  create actualDOM


getDocument = () ->
  unless documentRef?
    throw new Error('document is undefined\nTry calling jsdomify.create() before requesting it\n')
  documentRef


module.exports =
  create: create
  clear: clear
  destroy: destroy
  getDocument: getDocument
