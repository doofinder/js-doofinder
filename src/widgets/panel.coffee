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

    @rendered = false

  render: (res) ->
    # panels are rendered only once!!!
    unless @rendered
      @rendered = true
      @element[@options.insertionMethod] @renderTemplate res
      @initPanel res
      @renderContent res
      @trigger "df:widget:render", [res]
      @trigger "df:rendered", [res] # DEPRECATED

  initPanel: (res) ->
    @panelElement = $ "##{@options.templateVars.panelElement}"
    @labelElement = $ "##{@options.templateVars.labelElement}"
    @contentElement = $ "##{@options.templateVars.contentElement}"

  renderContent: (res) ->
    widget = @getWidget @
    widget.one "df:widget:render", ((res) ->
      @trigger "df:widget:renderContent", widget
    ).bind @
    @controller.registerWidget widget
    widget.render res

  clean: ->
    if @rendered
      # panels are never erased, nothing to do here
      @trigger "df:widget:clean"
      @trigger "df:cleaned" # DEPRECATED

module.exports = Panel
