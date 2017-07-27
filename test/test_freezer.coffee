# required for testing
chai = require "chai"

# chai
chai.should()
expect = chai.expect

# required for tests
freezer = require "../lib/util/freezer"

class Person
  constructor: (@name, @surname, @age) ->

# test
describe "Freezer", ->
  it "can freeze an entire object", (done) ->
    person =
      data:
        name: "John"
        surname: "Smith"
        age: 40
      email: "info@johnsmith.com"

    freezer.freeze person

    person.data.name = "Sarah"
    person.data.age = 20
    person.email = "info@sarahsmith.com"
    person.gender = "female"

    person.data.name.should.equal "John"
    person.data.age.should.equal 40
    person.email.should.equal "info@johnsmith.com"
    (expect person.gender).to.be.undefined  # new props can't be added
    done()

  it "can freeze a property of an object", (done) ->
    person = new Person "John", "Smith", 40

    freezer.freezeProperty person, "name", "Johnny"
    freezer.freezeProperty person, "age"
    person.name = "John Again"
    person.surname = "Cash"
    person.age = 30
    person.gender = "male"

    person.name.should.equal "Johnny"
    person.surname.should.equal "Cash"
    person.age.should.equal 40          # some things can change...
    person.gender.should.equal "male"   # new props can be added

    done()

