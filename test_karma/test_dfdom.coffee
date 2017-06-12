describe "dfdom tests:", ->
  # Reset Testing Environment

  resetBody = ->
    document.body.innerHTML = ""

  beforeEach ->
    resetBody()
    resetLayerOptions queryInput

  describe "adds a simple div", ->
    dfdom = doofinder.util.dfdom
    dfdom("body").append("div")