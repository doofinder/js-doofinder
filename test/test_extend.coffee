chai = require 'chai'
extend = require '../lib/util/extend'

chai.should()
assert = chai.assert
expect = chai.expect

describe 'extend', ->
  it 'one level uses the same memory instances for nested values', ->
    obj = {a: 1}
    date = new Date '2016-10-01 00:00:00'
    str = '5'
    arr = [obj, {b: 2}, {c: 3}]

    value =
      arr: arr
      obj:
        value: obj
      inner:
        date: date
      str: str

    copy = extend({}, value)

    # Test values
    expect(copy).to.be.eql value
    expect(copy.arr.length).to.be.equal 3
    expect(copy.arr[0]).to.be.eql {a: 1}
    expect(copy.arr[0]).to.be.eql obj
    expect(copy.inner.date).to.be.eql new Date '2016-10-01 00:00:00'
    expect(copy.inner.date).to.be.equal date
    expect(copy.str).to.be.eql '5'
    expect(copy.str).to.be.equal str

    assert.isTrue(copy.arr is arr)
    assert.isTrue(copy.arr[0] is obj)
    assert.isFalse(copy.date is date)
    assert.isTrue(copy.str is str)

  it 'deep uses different memory instances for objects and arrays', ->
    obj = {a: 1}
    date = new Date '2016-10-01 00:00:00'
    str = '5'
    arr = [obj, {b: 2}, {c: 3}]

    value =
      arr: [obj, {b: 2}, {c: 3}]
      obj:
        value: obj
      inner:
        date: date
      str: str

    copy = extend(true, {}, value)

    expect(copy).to.be.eql value
    expect(copy.arr.length).to.be.equal 3
    expect(copy.arr[0]).to.be.eql {a: 1}
    expect(copy.arr[0]).to.be.eql obj
    expect(copy.inner.date).to.be.eql new Date '2016-10-01 00:00:00'
    expect(copy.inner.date).to.be.equal date
    expect(copy.str).to.be.eql '5'
    expect(copy.str).to.be.equal str

    assert.isFalse(copy.arr is arr)
    assert.isFalse(copy.arr[0] is obj)
    assert.isFalse(copy.date is date)
    assert.isTrue(copy.str is str)

