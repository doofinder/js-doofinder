insertHTML = (html) ->
  document.body.innerHTML = [
    """<link rel="stylesheet" href="/base/test_karma/doofinder.css" type="text/css">""",
    html
  ].join "\n"

getController = ->
  client = new doofinder.Client "ffffffffffffffffffffffffffffffff", zone: "eu1"
  new doofinder.Controller client

getControllerMock = ->
  mock =
    refreshDone: false
    searchDone: false
    registerWidget: ->
    search: -> @searchDone = true
    refresh: -> @refreshDone = true
    addFilter: ->
    removeFilter: ->
