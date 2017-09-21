Display = require "../display"
extend = require "extend"

# A facet widget can have a label that represents the purpose of the filter.
# By default the name of the facet being rendered is used as the label of the
# widget.
defaultLabelTemplate = "{{label}}"


###*
 * Base class that represents a widget that renders a facet/filter control.
###
class BaseFacet extends Display
  ###*
   * @param  {String|Node|DfDomElement} element  Container node.
   * @param  {String} name    Name of the facet/filter.
   * @param  {Object} options Options object. Empty by default.
  ###
  constructor: (element, @name, options = {}) ->
    defaults =
      templateVars:
        label: options.label or @name
      labelTemplate: defaultLabelTemplate
    options = extend true, defaults, options

    super element, options

  ###*
   * Renders the label of the facet widget based on the given search response,
   * within the configured label template.
   *
   * @param  {Object} res Search response.
   * @return {String}     The rendered label.
  ###
  renderLabel: (res) ->
    @mustache.render @options.labelTemplate, @buildContext res


module.exports = BaseFacet
