# required for testing
chai = require "chai"

# chai
chai.should()
expect = chai.expect

# required for tests
nock = require "nock"
HttpClient = require "../lib/util/http"

describe "HttpClient", ->
  it "throws an error if no callback is passed on request", (done) ->
    client = new HttpClient()
    expect(-> client.request "http://www.doofinder.com").to.throw()
    done()

  it "executes callback with response", (done) ->
    scope = ((nock "http://www.doofinder.com").get "/something").reply 200, JSON.stringify "hello"
    client = new HttpClient()
    options =
      host: "www.doofinder.com"
      port: "80"
      path: "/something"

    client.request options, (err, data) ->
      data.should.equal "hello"
      scope.isDone().should.be.true
      done()
