describe "dfdom tests:", ->
  # Reset Testing Environment

  resetBody = ->
    document.body.innerHTML = ""

  insertHTML = (html) ->
    document.body.innerHTML = html

  beforeEach ->
    resetBody()

  describe "Simple dfdom executions", ->
    dfdom = doofinder.util.dfdom

    context "Creating DfDomElements", ->
      it "Not existing element", (done) ->
        div = dfdom("div")
        div.element.should.be.empty
        done()

      it "Gets existing element by tagName and CSS should return the same", (done) ->
        insertHTML """
        <ul class="test"></ul>
        """
        test = dfdom(".test")
        ul = dfdom("ul")
        el = document.querySelectorAll "ul"

        ul.should.eql test
        ul.element[0].should.eql el["0"]
        done()

      it "Call dfdom with the element and the selector should return the same", (done) ->
        insertHTML """
        <ul class="test"></ul>
        """
        el = document.querySelector ".test"

        fromClass = dfdom(".test")
        fromElement = dfdom(el)

        fromClass.should.eql fromElement
        done()

