# required for testing
chai = require "chai"
extend = require "extend"

# chai
chai.should()
expect = chai.expect

# required for tests
Text = require "../lib/util/text"

describe "Text Tools", ->
  it "converts camel case to dash case", (done) ->
    (Text.camel2dash "camelCaseCaseCA").should.equal "camel-case-case-c-a"
    done()

  it "converts dash case to camel case", (done) ->
    (Text.dash2camel "camel-case-case-c-a").should.equal "camelCaseCaseCA"
    done()

  it "has no effect camel to camel or dash to dash", (done) ->
    (Text.camel2dash "camel-case-case-c-a").should.equal "camel-case-case-c-a"
    (Text.dash2camel "camelCaseCaseCA").should.equal "camelCaseCaseCA"
    done()
