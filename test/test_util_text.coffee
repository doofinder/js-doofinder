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
