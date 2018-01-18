extend = require "extend"
Panel = require "./panel"


class CollapsiblePanel extends Panel
  constructor: (element, getWidget, options = {}) ->
    defaults =
      templateVars:
        label: "Untitled"
      startCollapsed: false
    options = extend true, defaults, options

    super element, getWidget, options

    Object.defineProperty @, 'isCollapsed', get: ->
      (@panelElement.attr "data-collapse") is "true"

  collapse: ->
    if @rendered
      @panelElement.attr "data-collapse", "true"
      @trigger "df:collapse:change", [true]

  expand: ->
    if @rendered
      @panelElement.attr "data-collapse", "false"
      @trigger "df:collapse:change", [false]

  toggle: ->
    if @rendered
      if @isCollapsed then @expand() else @collapse()

  reset: ->
    if @rendered
      if @options.startCollapsed then @collapse() else @expand()

  __initPanel: (res) ->
    super

    @panelElement.on "click", "##{@options.templateVars.labelElement}", (e) =>
      e.preventDefault()
      @toggle()

    @reset()

  clean: ->
    @reset()
    super


module.exports = CollapsiblePanel
