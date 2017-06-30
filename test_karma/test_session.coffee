describe "Session", ->
  Session = doofinder.session.Session

  testSessionDataHandling = (session, done) ->
    session.exists().should.be.false
    session.set "key", something: "value"
    (session.get "key", "other").should.eql something: "value"
    session.exists().should.be.true
    session.del "key"
    (session.get "key", "other").should.eq "other"
    session.exists().should.be.true
    session.delete()
    session.exists().should.be.false
    done()

  context "with ObjectSessionStore", ->
    it "handles data properly", (done) ->
      session = new Session()
      testSessionDataHandling session, done

    it "TODO: registerX methods!!!", (done) ->
      @skip()

  context "with CookieSessionStore", ->
    CookieSessionStore = doofinder.session.CookieSessionStore

    it "handles data properly", (done) ->
      store = new CookieSessionStore "Cookie", prefix: "my"
      session = new Session null, store
      store.cookieName.should.eq "myCookie"
      testSessionDataHandling session, done

    it "TODO: registerX methods!!!", (done) ->
      @skip()

  context "with invalid session store", ->
    it "fails miserably", (done) ->
      session = new Session null, {}
      expect(session.exists).to.throw()
      done()
