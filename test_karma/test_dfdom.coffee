describe "dfdom tests:", ->
  # Reset Testing Environment

  resetBody = ->
    document.body.innerHTML = ""

  insertHTML = (html) ->
    document.body.innerHTML = html


  describe "Simple dfdom executions", ->
    dfdom = doofinder.util.dfdom

    # Instantiation
    context "New instance of DfDomElement", ->
      beforeEach ->
        resetBody()

      it "is empty for an element that doesn't exist", (done) ->
        dfdom("div").element.should.be.empty
        done()

      it "returns null when no selector is provided", (done) ->
        expect(dfdom()).to.be.null
        expect(dfdom null).to.be.null
        done()

      it "can be instantiated with a CSS selector", (done) ->
        insertHTML """
        <ul class="test"></ul>
        """
        selection = (dfdom ".test")
        selection.element[0].should.eql (document.querySelector "ul")
        done()

      it "can be instantiated with a CSS selector being an instance of String", (done) ->
        insertHTML """
        <ul class="test"></ul>
        """
        selection = (dfdom (new String ".test"))
        selection.element[0].should.eql (document.querySelector "ul")
        done()

      it "can be instantiated with a HTMLElement node", (done) ->
        insertHTML """
        <ul class="test"></ul>
        """
        rawNode = document.querySelector ".test"
        (dfdom rawNode).element[0].should.eql rawNode
        done()

      it "can be instantiated with a NodeList", (done) ->
        insertHTML """
        <ul class="test">
          <li></li>
          <li></li>
        </ul>
        """
        rawNodes = document.querySelectorAll ".test li"
        selection = (dfdom rawNodes)
        selection.length().should.eq 2
        (selection.element.indexOf rawNodes[0]).should.eq 0
        done()

      it "can be instantiated with an array", (done) ->
        insertHTML """
        <ul class="test">
          <li></li>
          <li></li>
        </ul>
        """
        selection = dfdom ["ul", ".test", ".test > li", "li", document.querySelectorAll "li", []]
        selection.length().should.eq 3
        done()

      it "can be instantiated with multiple selectors separated by commas", (done) ->
        insertHTML """
        <ul class="test">
          <li></li>
          <li></li>
        </ul>
        """
        selection = dfdom "ul, .test, .test > li, li"
        selection.length().should.eq 3
        done()

      it "returns the same DfDomElement instance if passed to the dfdom function", (done) ->
        insertHTML """
        <ul class="test"></ul>
        """
        selection = dfdom "ul"
        (dfdom selection).should.eql selection
        done()

    context "Internal Utilities", ->
      it "can iterate each node in the set of matched elements", (done) ->
        insertHTML """
        <ul class="test">
          <li></li>
          <li>
            <ul class="test">
              <li></li>
              <li></li>
            </ul>
          </li>
        </ul>
        """
        count = 0
        items = (dfdom "li")
        items.each (item) ->
          items.element[count].should.eql item
          count++
        count.should.eq 4
        done()

      it "can map each node in the set of matched elements to a new array", (done) ->
        insertHTML """
        <ul class="test">
          <li></li>
          <li>
            <ul class="test">
              <li></li>
              <li></li>
            </ul>
          </li>
        </ul>
        """
        items = (dfdom "li")
        elements = items.map (item) -> item
        elements.should.eql items.element
        done()

    # Methods
    context "DOM Traversing Methods", ->
      it "can find nodes inside the set of matched elements given a selector", (done) ->
        insertHTML """
          <ul>
            <li></li>
          </ul>
          <ul class="test">
            <li></li>
            <li>
              <ul class="test">
                <li></li>
                <li></li>
              </ul>
            </li>
          </ul>
          <ul class="test">
            <li></li>
            <li></li>
          </ul>
        """
        ((dfdom ".test").find "li").length().should.eq 6
        ((dfdom ".test").find "div").length().should.eq 0
        done()

      it "can get the direct child nodes of the set of matched elements", (done) ->
        insertHTML """
          <ul class="test">
            <li></li>
            <li>
              <ul class="test">
                <li></li>
                <li></li>
              </ul>
            </li>
          </ul>
          <div></div>
        """
        (dfdom ".test").children().length().should.eq 4
        (dfdom "div").children().length().should.eq 0
        done()

      it "can retrieve the parent node for the set of matched elements", (done) ->
        insertHTML """
          <ul class="test">
            <li></li>
            <li></li>
          </ul>
          <ul class="test">
            <li></li>
            <li></li>
          </ul>
        """
        (dfdom "li").parent().length().should.eq 2
        done()

      it "can retrieve all parent nodes for the set of matched elements", (done) ->
        insertHTML """
        <div id="parent2" class="parent">
          <div id="parent1" class="parent">
            <div class="child"></div>
            <div class="child"></div>
          </div>
        </div>
        <div id="parent3">
          <div class="child"></div>
        </div>
        """
        parents = (dfdom ".child").parents()
        parents.length().should.eq 5
        parents.element[0].should.eql document.getElementById "parent1"
        parents.element[1].should.eql document.getElementById "parent2"
        parents.element[2].should.eql document.body
        parents.element[3].should.eql document.documentElement
        # This is due to the way DfDomElement.__uniquify() is programmed
        parents.element[4].should.eql document.getElementById "parent3"
        done()

      it "can retrieve all parent nodes that match a selector for the set of matched elements", (done) ->
        insertHTML """
        <div id="parent2" class="parent">
          <div id="parent1">
            <div class="child"></div>
            <div class="child"></div>
          </div>
        </div>
        <div id="parent3">
          <div class="child"></div>
        </div>
        """
        parents = (dfdom ".child").parents ".parent"
        parents.length().should.eq 1
        parents.element[0].should.eql document.getElementById "parent2"
        done()

      it "can retrieve the closest ancestor for the set of matched elements", (done) ->
        insertHTML """
        <div id="parent2" class="parent">
          <div id="parent1">
            <div class="child"></div>
            <div class="child"></div>
          </div>
        </div>
        <div id="parent3">
          <div class="child"></div>
        </div>
        """
        parents = (dfdom ".child").closest()
        parents.length().should.eq 2
        parents.element[0].should.eql document.getElementById "parent1"
        parents.element[1].should.eql document.getElementById "parent3"
        done()

      it "can retrieve the closest ancestor that matches a selector for the set of matched elements", (done) ->
        insertHTML """
        <div id="parent2" class="parent">
          <div id="parent1">
            <div class="child"></div>
            <div class="child"></div>
          </div>
        </div>
        <div id="parent3" class="parent">
          <div class="child"></div>
        </div>
        """
        parents = (dfdom ".child").closest ".parent"
        parents.length().should.eq 2
        parents.element[0].should.eql document.getElementById "parent2"
        parents.element[1].should.eql document.getElementById "parent3"
        done()

      it "can get specific nodes by index from the set of matched elements", (done) ->
        insertHTML """
        <div id="parent2" class="parent">
          <div id="parent1" class="parent">
            <div id="child"></div>
          </div>
        </div>
        """
        parent1 = (dfdom ".parent").get 1
        ((dfdom parent1).attr "id").should.equal "parent1"
        done()

      it "can return the length of the set of matched elements", (done) ->
        insertHTML """
          <ul class="test">
            <li></li>
            <li></li>
          </ul>
          <ul class="test">
            <li></li>
            <li></li>
          </ul>
        """

        (dfdom "li").length().should.equal 4
        done()

    context "DOM Manipulation Methods", ->
      beforeEach ->
        insertHTML """
          <div class="container"></div>
          <div class="container"></div>
        """

      it "can insert and retrieve HTML code", (done) ->
        code = """
          <div class="content"></div>
          <div class="content"></div>
        """
        containers = ((dfdom ".container").html code)
        containers.len.should.eq 2
        containers.children().len.should.eq 4
        containers.html().should.equal code
        done()

      it "can append HTML inside the set of matched elements", (done) ->
        (dfdom ".container").append """<div class="content"></div>"""
        contents = (dfdom ".content")
        contents.len.should.eq 2
        (contents.parents ".container").len.should.eq 2
        done()

      it "can append a node inside the set of matched elements", (done) ->
        (dfdom "body").append """<div class="copiedContent"></div>"""
        (dfdom ".copiedContent").len.should.eq 1
        (dfdom ".container").append ((dfdom ".copiedContent").get 0)
        contents = (dfdom ".copiedContent")
        contents.len.should.eq 2
        (contents.parents ".container").len.should.eq 2
        done()

      it "can prepend HTML inside the set of matched elements", (done) ->
        ((dfdom ".container").prepend """<div></div>""").prepend """<div class="content"></div>"""
        contents = dfdom ".content"
        contents.len.should.eq 2
        (contents.parents ".container").len.should.eq 2
        done()

      it "can prepend a node inside the set of matched elements", (done) ->
        (dfdom "body").prepend """<div class="copiedContent"></div>"""
        (dfdom ".copiedContent").len.should.eq 1
        ((dfdom ".container").prepend """<div></div>""").prepend (dfdom ".copiedContent").get 0
        contents = (dfdom ".copiedContent")
        contents.len.should.eq 2
        (contents.parents ".container").len.should.eq 2
        done()

      it "can insert HTML after the set of matched elements", (done) ->
        (dfdom ".container").after """<div class="container new"></div>"""
        containers = (dfdom ".container")
        containers.len.should.eq 4
        ((dfdom containers.get 1).hasClass "new").should.be.true
        ((dfdom containers.get 3).hasClass "new").should.be.true
        done()

      it "can insert a node after the set of matched elements", (done) ->
        (dfdom "body").prepend """<div class="new"></div>"""
        (dfdom ".new").len.should.eq 1
        (dfdom ".container").after (dfdom ".new").addClass "container"
        containers = (dfdom ".container")
        containers.len.should.eq 4
        ((dfdom containers.get 1).hasClass "new").should.be.true
        ((dfdom containers.get 3).hasClass "new").should.be.true
        done()

      it "can insert HTML before the set of matched elements", (done) ->
        (dfdom ".container").before """<div class="container new"></div>"""
        containers = (dfdom ".container")
        containers.len.should.eq 4
        ((dfdom containers.get 0).hasClass "new").should.be.true
        ((dfdom containers.get 2).hasClass "new").should.be.true
        done()

      it "can insert a node before the set of matched elements", (done) ->
        (dfdom "body").append """<div class="new"></div>"""
        (dfdom ".new").len.should.eq 1
        (dfdom ".container").before (dfdom ".new").addClass "container"
        containers = (dfdom ".container")
        containers.len.should.eq 4
        ((dfdom containers.get 0).hasClass "new").should.be.true
        ((dfdom containers.get 2).hasClass "new").should.be.true
        done()

      it "can empty the HTML content of a node", (done) ->
        (dfdom "body").empty().html().should.equal ""
        done()

      it "can remove the nodes in the set of matched elements", (done) ->
        removedContainers = (dfdom ".container").remove()
        removedContainers.len.should.equal 2
        (dfdom ".container").len.should.equal 0
        ((dfdom "body").append removedContainers).len.should.eq 1
        (dfdom ".container").len.should.equal 2
        done()

    context "Tag Attributes Methods", ->
      beforeEach ->
        insertHTML """
          <div></div>
          <div></div>
        """

      it "can set, retrieve, check and remove attributes", (done) ->
        # No attributes
        (expect ((dfdom "div").attr "foo")).to.be.null
        ((dfdom "div").hasAttr "foo").should.be.false

        # Set attribute
        (dfdom "div").attr "foo", "bar"
        (dfdom "div[foo='bar']").len.should.eq 2

        # Check and retrieve attribute
        ((dfdom "div").hasAttr "foo").should.be.true
        ((dfdom "div").attr "foo").should.equal "bar"

        # Remove attribute
        ((dfdom "div").removeAttr "foo")

        # No attributes again
        (expect ((dfdom "div").attr "foo")).to.be.null
        ((dfdom "div").hasAttr "foo").should.be.false

        done()

      it "can set and retrieve data attributes", (done) ->
        (expect ((dfdom "div").data "role")).to.be.null
        (dfdom "div").data "role", "presentational"
        (dfdom "div[data-role='presentational']").len.should.eq 2
        done()

      it "can get and set the value of elements that support it", (done) ->
        insertHTML """
        <div></div>
        <textarea>hello</textarea>
        <input type="text" value="hello">
        <input type="checkbox" value="hello">
        <input type="radio" name="radio" value="hello" checked>
        <input type="radio" name="radio" value="hola">
        """
        (expect (dfdom "div").val()).to.be.undefined
        (expect (dfdom "div").val("hello").val()).to.be.undefined

        (dfdom "textarea").val().should.equal "hello"
        (dfdom "textarea").val("bye").val().should.equal "bye"

        (dfdom "input[type='text']").val().should.equal "hello"
        (dfdom "input[type='text']").val("bye").val().should.equal "bye"

        (dfdom "input[type='checkbox']").val().should.equal "hello"
        (dfdom "input[type='checkbox']").val("bye").val().should.equal "bye"

        (dfdom "input[type='radio'][value='hello']").val().should.equal "hello"
        (dfdom "input[type='radio'][value='hello']").val("bye").val().should.equal "bye"
        (dfdom "input[type='radio'][value='hello']").len.should.eq 0

        (dfdom "input[type='radio'][value='hola']").val().should.equal "hola"
        (dfdom "input[type='radio'][value='hola']").val("adios").val().should.equal "adios"
        (dfdom "input[type='radio'][value='hola']").len.should.eq 0

        done()

      it "can add a class name to the set of matched elements", (done) ->
        (dfdom "div").addClass "foo"
        (dfdom ".foo").len.should.eq 2
        (dfdom ".foo").addClass "bar"
        (dfdom ".foo.bar").len.should.eq 2
        done()

      it "can check whether the set of matched elements has certain class name", (done) ->
        ((dfdom "div").hasClass "foo").should.be.false
        (((dfdom "div").addClass "foo").hasClass "foo").should.be.true
        done()

      it "can remove a class name from the set of matched elements", (done) ->
        ((((dfdom "div").addClass "foo").removeClass "foo").hasClass "foo").should.be.false
        done()

      it "can toggle a class name in the set of matched elements", (done) ->
        (((dfdom "div").toggleClass "foo").hasClass "foo").should.be.true
        (((dfdom ".foo").toggleClass "foo").hasClass "foo").should.be.false
        done()

    context "Style-related Methods", ->
      it "can set style properties and get computed style values", (done) ->
        insertHTML """<div class="customcss"></div>"""
        (dfdom ".customcss, .doesnotexist").css "width", "10rem"
        ((dfdom ".customcss").css "width").should.equal "160px"
        expect((dfdom ".doesnotexist").css "width").to.be.null
        done()

      it "can manage visibility of elements via their CSS display property", (done) ->
        insertHTML """
          <style>
            .inline { display: inline; }
            .block  { display: block;  }
          </style>
          <div class="inline"></div>
          <div class="nostyle"></div>
          <span class="block"></span>
          <span class="nostyle"></span>
        """
        (((dfdom ".block").hide()).css "display").should.equal "none"
        (((dfdom ".block").show()).css "display").should.equal "block"

        (((dfdom ".inline").hide()).css "display").should.equal "none"
        (((dfdom ".inline").show()).css "display").should.equal "inline"

        (((dfdom "div.nostyle").hide()).css "display").should.equal "none"
        (((dfdom "div.nostyle").show()).css "display").should.equal "block"

        (((dfdom "span.nostyle").hide()).css "display").should.equal "none"
        (((dfdom "span.nostyle").show()).css "display").should.equal "inline"
        done()

    context "Position, style and CSS classes management", ->
      beforeEach ->
        resetBody()

      it "width and height", (done) ->
        insertHTML """
        <div class="my-class"></div>
        <style>
          .my-class{
            width: 42px;
            height: 24px;
          }
        </style>
        """

        dfdom(".my-class").width().should.equal(42)
        dfdom(".my-class").height().should.equal(24)
        done()

      it "top left", (done) ->
        insertHTML """
          <div class="container">
            <div class="content">
            </div>
          </div>

          <style>
          .container {
            position: absolute;
            top: 5rem;
            left: 10rem;
          }
          .content {
            position: relative;
            margin-top: 15px;
            margin-left: 5px;
          }
          </style>
        """
        dfdom(".container").top().should.equal(80)
        dfdom(".container").left().should.equal(160)
        dfdom(".content").top().should.equal(95)
        dfdom(".content").left().should.equal(165)
        done()

      it "scroll", (done) ->
        insertHTML """
        <div id="container">
          <div id="content">
          </div>
        </div>
        <style>
        #container {
          height: 5rem;
          width: 5rem;
          overflow: scroll;
        }
        #content {
          height: 50rem;
          width: 50rem;
        }
        </style>
        """
        el = document.getElementById("container")
        dfdom(el).scrollTop().should.equal(0)
        el.scrollTop = 500
        dfdom(el).scrollTop().should.equal(500)
        dfdom(el).scrollTop(600).should.equal(600)
        dfdom(el).scrollTop().should.equal(600)
        dfdom(el).scrollLeft().should.equal(0)
        el.scrollLeft = 500
        dfdom(el).scrollLeft().should.equal(500)
        done()

    context "Event Management Methods", ->
      it "can bind, trigger and unbind events", (done) ->
        insertHTML """<input type="text" id="q">"""
        input = dfdom "#q"

        executed = 0
        input.on "df:foo", (e) -> executed += 1
        input.one "df:foo", (e) -> executed += 1
        input
          .trigger("df:foo")
          .trigger("df:foo")
          .trigger("df:foo")
        executed.should.eq 4

        executed = 0
        input.off "df:foo"
        input
          .trigger("df:foo")
          .trigger("df:foo")
          .trigger("df:foo")
        executed.should.eq 0

        done()
