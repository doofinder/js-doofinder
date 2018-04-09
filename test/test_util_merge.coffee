# required for testing
chai = require "chai"

# chai
chai.should()
expect = chai.expect

# required for tests
merge = require "../lib/util/merge"

describe "merge()", ->
  it "can merge", (done) ->
    source =
      a: 10
      b:
        c: 20
        d: 30
        e: [1, 2, 3, 4]
      f: [
          g: 1
          h: 2
          i: 3
        ,
          j: 4
          k: 5
          l: 6
      ]
      m: true

    patches =
      a: 20
      b:
        d: [40]
        e: [5, 6, 7, 8, 9]
      f: [
          g: 4
          h: 5
          i:
            j: 6
            k: 7
            l: 8
        ,
          9
      ]

    target = merge {}, source, patches

    source.a.should.equal 10
    patches.a.should.equal 20
    target.a.should.equal 20

    target.b.should.not.equal source.b
    target.b.c.should.equal 20
    target.b.d.should.not.equal patches.b.d
    target.b.d[0].should.equal 40
    target.b.e.should.not.equal patches.b.e
    target.b.e.should.eql [5, 6, 7, 8, 9]

    target.f.should.not.equal patches.f
    target.f.should.eql patches.f

    target.m.should.be.true

    done()
