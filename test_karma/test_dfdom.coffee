dispatchPatchedEvent = (element, type) ->
  event = document.createEvent "Event"
  event.initEvent type, true, true
  element.dispatchEvent event

patchElementEvent = (element, type) ->
  _nativeEvent = element[type].bind element
  element.focus = =>
    if document.hasFocus() then _nativeEvent() else (dispatchPatchedEvent element)

describe "dfdom", ->
  resetBody = ->
    document.body.innerHTML = ""

  insertHTML = (html) ->
    document.body.innerHTML = html

  dfdom = doofinder.util.dfdom

  context "[Instantiation]", ->
    beforeEach ->
      resetBody()

    it "is empty for an element that doesn't exist or when no selector is provided", (done) ->
      dfdom().element.should.be.empty
      (dfdom null).element.should.be.empty
      (dfdom "").element.should.be.empty
      (dfdom []).element.should.be.empty
      (dfdom ["", ""]).element.should.be.empty
      (dfdom "div").element.should.be.empty
      done()

    it "can be instantiated with the window object", (done) ->
      selection = (dfdom window)
      expect(selection.element[0]).to.eql window
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

    it "can be instantiated with a Window instance", (done) ->
      (dfdom window).length.should.eq 1
      done()

    it "can be instantiated with a HTMLDocument instance", (done) ->
      (dfdom document).length.should.eq 1
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
      selection.length.should.eq 2
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
      selection.length.should.eq 3
      done()

    it "can be instantiated with multiple selectors separated by commas", (done) ->
      insertHTML """
      <ul class="test">
        <li></li>
        <li></li>
      </ul>
      """
      selection = dfdom "ul, .test, .test > li, li"
      selection.length.should.eq 3
      done()

    it "returns the same DfDomElement instance if passed to the dfdom function", (done) ->
      insertHTML """
      <ul class="test"></ul>
      """
      selection = dfdom "ul"
      (dfdom selection).should.eql selection
      done()

  context "[Utilities]", ->
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

    it "can map nodes in the set of matched elements to a new DfDomElement", (done) ->
      insertHTML """
      <div></div>
      <div class="choose-me"></div>
      <div></div>
      <div class="choose-me"></div>
      """
      items = (dfdom "div")
      mappedItems = items.map ((node) -> node if (dfdom node).hasClass "choose-me")
      items.length.should.eq 4
      mappedItems.length.should.eq 2
      (mappedItems.first().hasClass "choose-me").should.be.true
      done()

    it "can filter nodes in the set of matched elements via a filterer method", (done) ->
      insertHTML """
      <div></div>
      <div class="choose-me"></div>
      <div></div>
      <div class="choose-me"></div>
      """
      items = (dfdom "div")
      filteredItems = items.filter ((node) -> (dfdom node).hasClass "choose-me")
      items.length.should.eq 4
      filteredItems.length.should.eq 2
      (filteredItems.first().hasClass "choose-me").should.be.true
      done()

    it "can filter nodes in the set of matched elements via a CSS selector", (done) ->
      insertHTML """
      <div></div>
      <div class="choose-me"></div>
      <div></div>
      <div class="choose-me"></div>
      """
      items = (dfdom "div")
      filteredItems = items.filter ".choose-me"
      items.length.should.eq 4
      filteredItems.length.should.eq 2
      (filteredItems.first().hasClass "choose-me").should.be.true
      done()

  # Methods
  context "[DOM Traversing Methods]", ->
    it "can get the first element properly", (done) ->
      insertHTML """
        <div class="first"></div>
        <div class="second"></div>
      """
      ((dfdom document).first().get 0).should.equal document
      ((dfdom document.body).first().get 0).should.equal document.body
      ((dfdom 'body').first().get 0).should.equal document.body
      (dfdom 'div').first().length.should.equal 1
      ((dfdom 'div').first().hasClass 'first').should.be.true
      done()

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
      ((dfdom ".test").find "li").length.should.eq 6
      ((dfdom ".test").find "div").length.should.eq 0
      done()

    it "can also find nodes from the window", (done) ->
      insertHTML "<p>Hello</p>"
      ((dfdom window).find "p").length.should.eq 1
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
      (dfdom ".test").children().length.should.eq 4
      (dfdom "div").children().length.should.eq 0
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
      (dfdom "li").parent().length.should.eq 2
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
      parents.length.should.eq 5
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
      parents.length.should.eq 1
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
      parents.length.should.eq 2
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
      parents.length.should.eq 2
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

  context "[DOM Manipulation Methods]", ->
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
      containers.length.should.eq 2
      containers.children().length.should.eq 4
      containers.html().should.equal code
      done()

    it "can append HTML inside the set of matched elements", (done) ->
      (dfdom ".container").append """<div class="content"></div>"""
      contents = (dfdom ".content")
      contents.length.should.eq 2
      (contents.parents ".container").length.should.eq 2
      done()

    it "can append a node inside the set of matched elements", (done) ->
      (dfdom "body").append """<div class="copiedContent"></div>"""
      (dfdom ".copiedContent").length.should.eq 1
      (dfdom ".container").append ((dfdom ".copiedContent").get 0)
      contents = (dfdom ".copiedContent")
      contents.length.should.eq 2
      (contents.parents ".container").length.should.eq 2
      done()

    it "can prepend HTML inside the set of matched elements", (done) ->
      ((dfdom ".container").prepend """<div></div>""").prepend """<div class="content"></div>"""
      contents = dfdom ".content"
      contents.length.should.eq 2
      (contents.parents ".container").length.should.eq 2
      done()

    it "can prepend a node inside the set of matched elements", (done) ->
      (dfdom "body").prepend """<div class="copiedContent"></div>"""
      (dfdom ".copiedContent").length.should.eq 1
      ((dfdom ".container").prepend """<div></div>""").prepend (dfdom ".copiedContent").get 0
      contents = (dfdom ".copiedContent")
      contents.length.should.eq 2
      (contents.parents ".container").length.should.eq 2
      done()

    it "can insert HTML after the set of matched elements", (done) ->
      (dfdom ".container").after """<div class="container new"></div>"""
      containers = (dfdom ".container")
      containers.length.should.eq 4
      ((dfdom containers.get 1).hasClass "new").should.be.true
      ((dfdom containers.get 3).hasClass "new").should.be.true
      done()

    it "can insert a node after the set of matched elements", (done) ->
      (dfdom "body").prepend """<div class="new"></div>"""
      (dfdom ".new").length.should.eq 1
      (dfdom ".container").after (dfdom ".new").addClass "container"
      containers = (dfdom ".container")
      containers.length.should.eq 4
      ((dfdom containers.get 1).hasClass "new").should.be.true
      ((dfdom containers.get 3).hasClass "new").should.be.true
      done()

    it "can insert HTML before the set of matched elements", (done) ->
      (dfdom ".container").before """<div class="container new"></div>"""
      containers = (dfdom ".container")
      containers.length.should.eq 4
      ((dfdom containers.get 0).hasClass "new").should.be.true
      ((dfdom containers.get 2).hasClass "new").should.be.true
      done()

    it "can insert a node before the set of matched elements", (done) ->
      (dfdom "body").append """<div class="new"></div>"""
      (dfdom ".new").length.should.eq 1
      (dfdom ".container").before (dfdom ".new").addClass "container"
      containers = (dfdom ".container")
      containers.length.should.eq 4
      ((dfdom containers.get 0).hasClass "new").should.be.true
      ((dfdom containers.get 2).hasClass "new").should.be.true
      done()

    it "can empty the HTML content of a node", (done) ->
      (dfdom "body").empty().html().should.equal ""
      done()

    it "can remove the nodes in the set of matched elements", (done) ->
      removedContainers = (dfdom ".container").remove()
      removedContainers.length.should.equal 2
      (dfdom ".container").length.should.equal 0
      ((dfdom "body").append removedContainers).length.should.eq 1
      (dfdom ".container").length.should.equal 2
      done()

  context "[Tag Attributes Methods]", ->
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
      (dfdom "div[foo='bar']").length.should.eq 2

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
      (dfdom "div[data-role='presentational']").length.should.eq 2
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
      (dfdom "input[type='radio'][value='hello']").length.should.eq 0

      (dfdom "input[type='radio'][value='hola']").val().should.equal "hola"
      (dfdom "input[type='radio'][value='hola']").val("adios").val().should.equal "adios"
      (dfdom "input[type='radio'][value='hola']").length.should.eq 0

      done()

    it "can add a class name to the set of matched elements", (done) ->
      (dfdom "div").addClass "foo"
      (dfdom ".foo").length.should.eq 2
      (dfdom ".foo").addClass "bar"
      (dfdom ".foo.bar").length.should.eq 2
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

  context "[Style-related Methods]", ->
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

  context "[Measurement Methods]", ->
    beforeEach ->
      resetBody()

    it "can measure width and height", (done) ->
      insertHTML """
        <style>
          .rect {
            width: 100px;
            height: 60px;
            border: 5px solid red;
            padding: 5px;
            margin: 5px;
          }
        </style>
        <div class="rect"></div>
      """
      rect = dfdom ".rect"
      rect.css "box-sizing", "content-box"
      rect.width().should.eq 120
      rect.height().should.eq 80
      rect.css "box-sizing", "border-box"
      rect.width().should.eq 100
      rect.height().should.eq 60
      done()

    it "can measure the top and left position of the first element in the set", (done) ->
      insertHTML """
        <style>
          html {
            font-size: 10px;
          }
          body {
            margin: 0;
            padding: 1rem;
          }
          .container {
            position: relative;
            top: 1rem;
            left: 1rem;
            border: 10px solid red;
          }
          .content {
            position: absolute;
            top: 10px;
            left: 10px;
          }
        </style>
        <div class="container">
          <div class="content"></div>
        </div>
      """
      container = dfdom ".container"
      content = dfdom ".content"

      container.top().should.equal 20
      container.left().should.equal 20

      content.top().should.equal 40
      content.left().should.equal 40
      done()

    it "can measure and set the scroll of the first node in the set of matched elements", (done) ->
      insertHTML """
        <div id="container">
          <div id="content"></div>
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
      container = dfdom "#container"

      container.scrollTop().should.eq 0
      (container.get 0).scrollTop = 500
      container.scrollTop().should.eq 500
      container.scrollTop 400
      container.scrollTop().should.eq 400

      container.scrollLeft().should.eq 0
      (container.get 0).scrollLeft = 500
      container.scrollLeft().should.eq 500
      container.scrollLeft 400
      container.scrollLeft().should.eq 400
      done()

  context "[Event Management Methods]", ->
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

    context "[Special Events]", ->
      beforeEach: ->
        insertHTML """<input type="text" id="q">"""
        element = document.getElementById "q"
        patchElementEvent element, "focus"
        patchElementEvent element, "blur"

      it "can properly trigger and capture focus events", (done) ->
        ((dfdom "#q").on "focus", -> done()).focus()

      it "can properly trigger and capture blur events", (done) ->
        ((dfdom "#q").on "blur", -> done()).focus().blur()

  context "[Other Tools]", ->
    beforeEach ->
      insertHTML """
        <div class="box"></div>
        <div id="box"></div>
        <div></div>
      """

    it "can reduce the set of matched elements to the one in the provided index", (done) ->
      ((dfdom "div").eq 3).length.should.eq 0
      ((dfdom "div").eq 0).length.should.eq 1
      (((dfdom "div").eq 0).hasClass "box").should.be.true
      (((dfdom "div").eq -2).get 0).should.equal document.getElementById "box"
      done()

    it "can detect if the selection matches a selector", (done) ->
      (((dfdom "div").eq 0).is ".box").should.be.true
      ((dfdom "div").is ".box").should.be.true
      ((dfdom "#box").is document.getElementById "box").should.be.true
      ((dfdom "div").is document.getElementById "box").should.be.true
      ((dfdom "div").is ".inline").should.be.false
      done()

    it "can detect if the selection does not match a selector", (done) ->
      (((dfdom "div").eq 0).isnt ".box").should.be.false
      ((dfdom "div").isnt ".box").should.be.false
      ((dfdom "#box").isnt document.getElementById "box").should.be.false
      ((dfdom "div").isnt document.getElementById "box").should.be.false
      ((dfdom "div").isnt ".inline").should.be.true
      done()

