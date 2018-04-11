# required for testing
chai = require "chai"

# chai
chai.should()
expect = chai.expect

# required for tests
merge = require "../lib/util/merge"

describe "merge()", ->
  it "can merge", (done) ->
    options =
      address: "http://localhost:4000"
      display:
        lang: "es"
        list: [
            a: 2
            b: 2
            c: 2
        ]
      zone: "eu1"

    defaults =
      callbacks: {}
      googleAnalytics: true
      zone: 'us1'
      display:
        captureLength: 3
        wait: 42
        lang: "en"
        template: "template.layer"
        list: [
            a: 1
            b: 1
            c: 1
          ,
            d: 1
            e: 1
            f: 1
          ,
          3
        ]
        layer:
          container: "bad"
        results:
          container: "bad"
          template: "template.results"
        header:
          container: "bad"
          template: "template.header"
        facets:
          container: "bad"

    overrides =
      display:
        layer:
          container: "mainContainerId"
        results:
          container: "container.results"
        header:
          container: "container.header"
        facets:
          container: "container.aside"

    target = merge {}, defaults, options, overrides

    target.address.should.equal "http://localhost:4000"
    target.callbacks.should.eql {}
    target.display.captureLength.should.equal 3
    target.display.lang.should.equal "es"
    target.display.list.length.should.equal 3
    target.display.list[0].a.should.equal 2
    target.display.list[0].b.should.equal 2
    target.display.list[0].c.should.equal 2
    target.display.list[1].d.should.equal 1
    target.display.list[1].e.should.equal 1
    target.display.list[1].f.should.equal 1
    target.display.list[2].should.equal 3
    target.display.results.container.should.equal "container.results"
    target.display.results.template.should.equal "template.results"
    target.display.template.should.equal "template.layer"
    target.googleAnalytics.should.be.true
    target.zone.should.equal "eu1"

    done()
