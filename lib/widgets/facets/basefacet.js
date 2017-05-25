(function() {
  var BaseFacet, Display, extend,
    extend1 = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Display = require("../display");

  extend = require("extend");


  /**
   * Base class that represents a widget that renders a facet/filter control.
   */

  BaseFacet = (function(superClass) {
    extend1(BaseFacet, superClass);

    BaseFacet.defaultLabelTemplate = "{{label}}";


    /**
     * @param  {String|Node|DfDomElement} element  Container node.
     * @param  {String} name    Name of the facet/filter.
     * @param  {Object} options Options object. Empty by default.
     */

    function BaseFacet(element, name, options) {
      var defaults;
      this.name = name;
      if (options == null) {
        options = {};
      }
      defaults = {
        templateVars: {
          label: options.label || this.name
        },
        labelTemplate: this.constructor.defaultLabelTemplate,
        template: this.constructor.defaultTemplate
      };
      options = extend(true, defaults, options);
      BaseFacet.__super__.constructor.call(this, element, options.template, options);
    }


    /**
     * Renders the label of the facet widget based on the given search response,
     * within the configured label template.
     *
     * @param  {Object} res Search response.
     * @return {String}     The rendered label.
     */

    BaseFacet.prototype.renderLabel = function(res) {
      return this.mustache.render(this.options.labelTemplate, this.buildContext(res));
    };


    /**
     * Called when subsequent (not "first-page") responses for a specific search
     * are received. Usually not used in this kind of widgets. Here is overwritten
     * to avoid strange behavior.
     *
     * @param {Object} res Search response.
     */

    BaseFacet.prototype.renderNext = function(res) {};

    return BaseFacet;

  })(Display);

  module.exports = BaseFacet;

}).call(this);
