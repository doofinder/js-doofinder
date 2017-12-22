# required for testing
chai = require "chai"

# chai
chai.should()
expect = chai.expect

# required for tests
currency = require "../lib/util/currency"

# test
describe "util.currency", ->
  it "uses default currency spec if not provided", (done) ->
    (currency.format 1).should.equal "1€"
    (currency.format 1000.01).should.equal "1.000,01€"
    done()

  it "uses provided currency spec if provided", (done) ->
    format =
      symbol: "$"
      format: "%s%v"
      decimal: "."
      thousand: ","
      precision: 3
    (currency.format 1, format).should.equal "$1"
    (currency.format 1000.01, format).should.equal "$1,000.010"
    done()

  it "can't parse numbers provided as string", (done) ->
    expect(-> currency.format "1").to.throw()
    expect(-> currency.format "1000.01").to.throw()
    done()

  it "throws error if an invalid string is provided", (done) ->
    expect(-> currency.format "hello").to.throw()
    done()
