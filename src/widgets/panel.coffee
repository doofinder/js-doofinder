extend = require "extend"
Display = require "./display"
$ = require "../util/dfdom"
uniqueId = require "../util/uniqueid"


INSERTION_METHODS = ["prepend", "append", "before", "after", "html"]


defaultTemplate = """
  <div class="df-panel" id="{{panelElement}}">
    {{#label}}
    <div class="df-panel__label" id="{{labelElement}}">{{label}}</div>
    {{/label}}
    <div class="df-panel__content" id="{{contentElement}}"></div>
  </div>
"""


class Panel extends Display
  constructor: (element, @getWidget, options = {}) ->
    defaults =
      templateVars:
        label: null
        panelElement: "df-#{uniqueId.generate.easy()}"
        labelElement: "df-#{uniqueId.generate.easy()}"
        contentElement: "df-#{uniqueId.generate.easy()}"
      insertionMethod: "append" # html, append, prepend, before, after
      template: defaultTemplate

    options = extend true, defaults, options

    unless options.insertionMethod in INSERTION_METHODS
      options.insertionMethod = "append"

    super element, options

    @panelElement = null
    @labelElement = null
    @contentElement = null

  render: (res) ->
    unless @panelElement
      # render template
      @element[@options.insertionMethod] @renderTemplate res
      @initPanel res
      @initContent res
      @trigger "df:widget:render", [res]

  initPanel: (res) ->
    @panelElement = $ "##{@options.templateVars.panelElement}"
    @labelElement = $ "##{@options.templateVars.labelElement}"
    @contentElement = $ "##{@options.templateVars.contentElement}"

  initContent: (res) ->
    widget = @getWidget @
    @controller.registerWidget widget
    widget.render res

  clean: ->
    @trigger "df:widget:clean"

module.exports = Panel
