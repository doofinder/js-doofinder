insertHTML = (html) ->
  document.body.innerHTML = [
    """<link rel="stylesheet" href="/base/test_karma/doofinder.css" type="text/css">""",
    html
  ].join "\n"

getController = ->
  client = new doofinder.Client "ffffffffffffffffffffffffffffffff"
  new doofinder.Controller client

getControllerMock = ->
  mock =
    addFilter: ->
    removeFilter: ->
    refresh: ->
    registerWidget: ->
