describe "dfdom tests:", ->
  # Reset Testing Environment

  resetBody = ->
    document.body.innerHTML = ""

  insertHTML = (html) ->
    document.body.innerHTML = html


  describe "Simple dfdom executions", ->
    dfdom = doofinder.util.dfdom

    # Instantiation
    context "Creating DfDomElements", ->
      beforeEach ->
        resetBody()

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

    # Methods
    context "Basic DOM Hierarchy Management", ->
      it "Testing each", (done) ->
        insertHTML """
        <ul class="test">
          <li>
          </li>
          <li>
          </li>
        </ul>
        """
        count = 0
        dfdom("li").each () ->
          count++
        count.should.equal 2
        done()

      it "Find", (done) ->
        insertHTML """
          <ul class="test">
            <li>
            </li>
            <li>
            </li>
          </ul>
          <ul class="test">
            <li>
            </li>
            <li>
            </li>
          </ul>
        """
        dfdom(".test").find("li").length().should.equal(4)
        dfdom(".test").find("div").length().should.equal(0)
        done()

      it "Children", (done) ->
        insertHTML """
          <ul class="test">
            <li>
            </li>
            <li>
            </li>
          </ul>
          <ul class="test">
            <li>
            </li>
            <li>
            </li>
          </ul>
          <div></div>
        """
        dfdom(".test").children().length().should.equal(4)
        dfdom("div").children().length().should.equal(0)
        done()

      it "Parent", (done) ->
        insertHTML """
          <ul class="test">
            <li>
            </li>
            <li>
            </li>
          </ul>
          <ul class="test">
            <li>
            </li>
            <li>
            </li>
          </ul>
        """
        dfdom("li").parent().length().should.equal(2)
        done()

      it "Closest", (done) ->
        insertHTML """
        <div id="parent2" class="parent">
          <div id="parent1" class="parent">
            <div id="child">
            </div>
          </div>
        </div>
        """
        dfdom("#child").closest(".parent").attr("id").should.equal("parent1")
        done()

      it "Parents", (done) ->
        insertHTML """
        <div id="parent2" class="parent">
          <div id="parent1" class="parent">
            <div id="child">
            </div>
          </div>
        </div>
        """
        parent1 = document.getElementById("parent1")
        parent2 = document.getElementById("parent2")
        body = document.body
        html = document.documentElement

        dfdom("#child").parents().
          element
          .should.eql([parent1, parent2, body, html])
        done()

      it "Get", (done) ->
        insertHTML """
        <div id="parent2" class="parent">
          <div id="parent1" class="parent">
            <div id="child">
            </div>
          </div>
        </div>
        """

        dfdom(".parent")
          .get(1)
          .attr("id")
          .should.equal("parent1")
        done()

      it "Length", (done) ->
        insertHTML """
          <ul class="test">
            <li>
            </li>
            <li>
            </li>
          </ul>
          <ul class="test">
            <li>
            </li>
            <li>
            </li>
          </ul>
        """

        dfdom("li")
          .length()
          .should.equal(4)
        
        done()

    context "Content retrieving and injection", ->
      beforeEach ->
        insertHTML """
          <ul id='test'>
            <li id='item2'>
            </li>
          </ul>
        """
      it "html", (done) ->
        insertHTML """
        <div class="container"></div>
        """
        dfdom(".container").html('<div class="content"></div>')
          .element[0]
          .innerHTML
          .should.equal('<div class="content"></div>')
        done()

      it "append", (done) ->
        insertHTML """
          <ul id='test'>
            <li id='item1'>
            </li>
            <li id='item2'>
            </li>
          </ul>
        """
        dfdom("#test")
          .append("<li id='item3'></li>")
        
        dfdom("li")
          .get(2)
          .attr("id")
          .should.equal("item3")
        
        li = document.createElement("li")
        li.id = "item4"
        dfdom("#test").append(li)
        dfdom("li")
          .get(3)
          .attr("id")
          .should.equal("item4")
        
        done()

      it "prepend", (done) ->
        dfdom("#test").prepend("<li id='item1'></li>")
        dfdom("li")
          .get(0)
          .attr("id")
          .should.equal("item1")
        
        li = document.createElement("li")
        li.id = "item0"
        dfdom("#test").prepend(li)
        dfdom("li")
          .get(0)
          .attr("id")
          .should.equal("item0")
        done()

      it "after", (done) ->
        dfdom("#item2").after("<li id='item3'></li>")
        dfdom("li")
          .get(1)
          .attr("id")
          .should.equal("item3")
        
        li = document.createElement("li")
        li.id = "item4"
        dfdom("#item3").after(li)
        dfdom("li")
          .get(2)
          .attr("id")
          .should.equal("item4")
        done()

      it "before", (done) ->

        dfdom("#item2").before("<li id='item1'></li>")
        dfdom("li").get(0).attr("id").should.equal("item1")
        
        li = document.createElement("li")
        li.id = "item0"
        dfdom("#item1").before(li)
        dfdom("li")
          .get(0)
          .attr("id")
          .should.equal("item0")
        done()

      it "empty", (done) ->
        dfdom("#test").empty()
          .element[0]
          .innerHTML
          .should.equal("")
        done()

    context "Tag attributes", ->
      beforeEach ->
        insertHTML """
          <div foo="bar" data-role="main"></div>
        """
      it "attr", (done) ->
        dfdom("div")
          .attr("foo")
          .should.equal("bar")
        dfdom("div")
          .attr("foo", "lorem ipsum")
          .should.equal("lorem ipsum")
        dfdom("[data-role='main']")
          .attr("foo")
          .should.equal("lorem ipsum")
        done()

      it "removeAttr", (done) ->
        dfdom("div")
          .removeAttr("foo")
        assert dfdom("div").attr("foo") == null
        done()

      it "hasAttr", (done) ->
        dfdom("div").hasAttr("foo").should.be.true
        dfdom("div").hasAttr("xxx").should.be.false
        done()

      it "data", (done) ->
        dfdom("div").data("role").should.equal("main")
        dfdom("div").data("other", "whatever").should.equal("whatever")
        dfdom("div").data("other").should.equal("whatever")
        done()

      it "val", (done) ->
        insertHTML """
        <input value="hello" />
        """
        dfdom("input").val().should.equal("hello")
        dfdom("input").val("goodbye").should.equal("goodbye")
        dfdom("input").val().should.equal("goodbye")
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

      it "addClass", (done) ->
        insertHTML """
        <div class="foo"></div>
        """
        foo = dfdom(".foo")
        foo.element[0].classList
          .contains("bar")
          .should.be.false
        foo.addClass("bar")
        foo.element[0].classList
          .contains("bar")
          .should.be.true
        done()

      it "removeClass", (done) ->
        insertHTML """
        <div class="foo"></div>
        """
        foo = dfdom(".foo")
        foo.element[0].classList
          .contains("foo")
          .should.be.true
        foo.removeClass("foo")
        foo.element[0].classList
          .contains("foo")
          .should.be.false
        done()

      it "toggleClass", (done) ->
        insertHTML """
        <div class="foo"></div>
        """
        foo = dfdom(".foo")
        foo.element[0].classList
          .contains("foo")
          .should.be.true
        foo.toggleClass("foo")
        foo.element[0].classList
          .contains("foo")
          .should.be.false
        foo.toggleClass("foo")
        foo.element[0].classList
          .contains("foo")
          .should.be.true
        done()

      it "hasClass", (done) ->
        insertHTML """
        <div class="foo"></div>
        """
        foo = dfdom(".foo")
        foo.hasClass("foo").should.be.true
        foo.hasClass("bar").should.be.false
        done()

      it "css", (done) ->
        insertHTML """
        <div class="foo"></div>
        """
        foo = dfdom(".foo")
        foo.height().should.equal(0)
        foo.css("height", "10rem").should.equal("160px")
        foo.height().should.equal(160)
        done()

      it "show", (done) ->
        insertHTML """
          <div class="foo"></div>
          <style>
          .foo{
            display: none;
          }
          </style>
        """
        foo = dfdom(".foo")
        getComputedStyle(foo._first())["display"]
          .should.equal("none")
        foo.show()
        getComputedStyle(foo._first())["display"]
          .should.equal("block")
        done()

      it "hide", (done) ->
        insertHTML """
          <div class="foo"></div>
          <style>
          .foo{
            display: block;
          }
          </style>
        """
        foo = dfdom(".foo")
        getComputedStyle(foo._first())["display"]
          .should.equal("block")
        foo.hide()
        getComputedStyle(foo._first())["display"]
          .should.equal("none")
        done()

    context "Event management", ->
      beforeEach ->
        insertHTML """
        <input type=text />
        """

      it "binding and triggering events", (done) ->
        input = dfdom("input")
        executionTimes = 0
        input.on "df:foo", () ->
          executionTimes += 1
        
        input.trigger("df:foo")
        input.trigger("df:foo")
        input.trigger("df:foo")
        
        executionTimes.should.equal(3)
        done()

      it "binding and unbinding events", (done) ->
        input = dfdom("input")
        executed = false
        input.on "df:foo", () ->
          executed = true
        input.off "df:foo"
        
        input.trigger "df:foo"
        
        executed.should.be.false
        done()

      it "binding events just once", (done) ->
        input = dfdom("input")
        executionTimes = 0
        input.one "df:foo", () ->
          executionTimes += 1

        input.trigger "df:foo"
        input.trigger "df:foo"
        input.trigger "df:foo"

        executionTimes.should.equal(1)
        done()





