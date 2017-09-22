extend = require "extend"
Panel = require "./panel"


class CollapsiblePanel extends Panel
  constructor: (element, getWidget, options = {}) ->
    defaults =
      startCollapsed: false
    options = extend true, defaults, options

    super

    Object.defineProperty @, 'isCollapsed', get: ->
      (@panelElement.attr "data-df-collapse") is "true"

  collapse: ->
    @panelElement.attr "data-df-collapse", "true"

  expand: ->
    @panelElement.attr "data-df-collapse", "false"

  toggle: ->
    if @isCollapsed then @expand() else @collapse()

  reset: ->
    if @options.startCollapsed then @collapse() else @expand()

  initPanel: (res) ->
    super

    @panelElement.on "click", "##{@options.templateVars.labelElement}", (e) =>
      e.preventDefault()
      @toggle()

    @reset()

  clean: ->
    @reset()
    super


module.exports = CollapsiblePanel
