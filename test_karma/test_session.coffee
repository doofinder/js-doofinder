describe "Session", ->
  Session = doofinder.session.Session

  context "with CookieSessionStore", ->
    CookieSessionStore = doofinder.session.CookieSessionStore

    it "handles data properly", (done) ->
      store = new CookieSessionStore "Cookie", prefix: "my"
      session = new Session null, store
      store.cookieName.should.eq "myCookie"
      session.exists().should.be.false
      session.set "key", something: "value"
      (session.get "key", "other").should.eql something: "value"
      session.exists().should.be.true
      session.del "key"
      (session.get "key", "other").should.eq "other"
      session.exists().should.be.true
      session.clean()
      session.exists().should.be.false
      done()

  context "with invalid session store", ->
    it "fails miserably", (done) ->
      class BadSessionStore extends doofinder.session.ISessionStore
        constructor: (@data = {}) ->
        __getData: -> @data
        __setData: (@data) ->

      session = new Session (new BadSessionStore())
      session.set 'key', 'value'
      expect(-> session.get 'key').to.throw()
      expect(session.exists).to.throw()
      done()
