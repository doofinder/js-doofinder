# required for testing
chai = require "chai"

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

  it "converts first char of all words to uppercase", (done) ->
    (Text.ucwords "camel camel").should.equal "Camel Camel"
    (Text.ucwords "Camel Camel").should.equal "Camel Camel"
    done()

  it "converts first char of first word to uppercase", (done) ->
    (Text.ucfirst "camel camel").should.equal "Camel camel"
    (Text.ucfirst "Camel camel").should.equal "Camel camel"
    done()

  it "converts text with spaces to snake case", (done) ->
    (Text.toSnake "snake    snake snake").should.equal "snake_snake_snake"
    done()

  it "translates text given a dictionary or returns the same if no translation found", (done) ->
    translations = "hello world": "hola mundo"
    (Text.translate "hello world", translations).should.equal "hola mundo"
    (Text.translate "hello world!", translations).should.equal "hello world!"
    done()

  it "unescapes text encoded multiple times", (done) ->
    (Text.unescape "http://victim/cgi/%252E%252E%252F%252E%252E%252Fwinnt/system32/cmd.exe?/c+dir+c:\\").should.equal "http://victim/cgi/../../winnt/system32/cmd.exe?/c+dir+c:\\"
    done()
