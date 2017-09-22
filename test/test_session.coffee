# required for testing
chai = require "chai"

# chai
chai.should()

# required for tests
session = require "../lib/session"
Session = session.Session
ISessionStore = session.ISessionStore

# config, utils & mocks
class BadSessionStore extends ISessionStore
  constructor: (@data = {}) ->
  __getData: -> @data
  __setData: (@data) ->

# test
describe "Session", ->
  context "with ObjectSessionStore", ->
    it "handles data properly", (done) ->
      session = new Session()
      # Session.__getData never accessed
      session.exists().should.be.false
      session.set "key", something: "value"
      # Session.__getData accessed to set key
      session.exists().should.be.true
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
      store = new BadSessionStore()
      session = new Session store
      session.set 'key', 'value'
      (-> session.get 'key').should.throw()
      session.exists.should.throw()
      done()
