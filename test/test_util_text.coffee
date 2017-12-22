# required for testing
chai = require "chai"
extend = require "extend"

# chai
chai.should()
expect = chai.expect

# required for tests
text = require "../lib/util/text"

describe "text tools", ->
  it "converts camel case to dash case", (done) ->
    (text.toDashCase "camelCaseCaseCA").should.equal "camel-case-case-c-a"
    done()

  it "converts dash case to camel case", (done) ->
    (text.toCamelCase "camel-case-case-c-a").should.equal "camelCaseCaseCA"
    done()
