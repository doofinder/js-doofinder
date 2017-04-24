Display = require "../display"
extend = require "extend"


###*
 * Common behavior of a facet widget.
###
class BaseFacet extends Display
  @defaultLabelTemplate: "{{label}}"

  constructor: (element, @name, options = {}) ->
    defaults =
      templateVars:
        label: options.label or @name
      labelTemplate: @constructor.defaultLabelTemplate
      template: @constructor.defaultTemplate
    options = extend true, defaults, options

    super element, options.template, options

  renderLabel: (res) ->
    @mustache.render @options.labelTemplate, @addHelpers res

  renderNext: (res) ->


module.exports = BaseFacet
