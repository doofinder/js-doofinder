insertHTML = (html) ->
  html = [
    "<link rel='stylesheet' href='/base/test_karma/doofinder.css' type='text/css'>",
    html
  ]
  document.body.innerHTML = html.join "\n"

dispatchPatchedEvent = (element, type) ->
  event = document.createEvent "Event"
  event.initEvent type, true, true
  element.dispatchEvent event

patchElementEvent = (element, type) ->
  _nativeEvent = element[type].bind element
  element.focus = =>
    if document.hasFocus() then _nativeEvent() else (dispatchPatchedEvent element)

getController = ->
  client = new doofinder.Client "ffffffffffffffffffffffffffffffff"
  new doofinder.Controller client

getControllerMock = ->
  mock =
    addFilter: (key, value) ->
    removeFilter: (key) ->
    refresh: ->
