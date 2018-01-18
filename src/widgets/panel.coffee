extend = require "extend"
Display = require "./display"
$ = require "../util/dfdom"
uniqueId = require "../util/uniqueid"


INSERTION_METHODS = ["prepend", "append", "before", "after", "html"]


class Panel extends Display
  @defaultTemplate = """
    <div class="df-panel" id="{{panelElement}}">
      {{#label}}
      <div class="df-panel__label" id="{{labelElement}}">{{label}}</div>
      {{/label}}
      <div class="df-panel__content" id="{{contentElement}}"></div>
    </div>
  """

  constructor: (element, @getWidget, options = {}) ->
    defaults =
      templateVars:
        label: null
        panelElement: "df-#{uniqueId.generate.easy()}"
        labelElement: "df-#{uniqueId.generate.easy()}"
        contentElement: "df-#{uniqueId.generate.easy()}"
      insertionMethod: "append" # html, append, prepend, before, after
      template: @constructor.defaultTemplate

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
      @element[@options.insertionMethod] @__renderTemplate res
      @__initPanel res
      @__renderContent res
      @trigger "df:widget:render", [res]

  __initPanel: (res) ->
    @panelElement = $ "##{@options.templateVars.panelElement}"
    @labelElement = $ "##{@options.templateVars.labelElement}"
    @contentElement = $ "##{@options.templateVars.contentElement}"

  __renderContent: (res) ->
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

module.exports = Panel
