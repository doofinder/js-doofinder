(function() {
  var BaseFacet, Display, extend,
    extend1 = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Display = require("../display");

  extend = require("extend");


  /**
   * Common behavior of a facet widget.
   */

  BaseFacet = (function(superClass) {
    extend1(BaseFacet, superClass);

    BaseFacet.defaultLabelTemplate = "{{label}}";

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

    BaseFacet.prototype.renderLabel = function(res) {
      return this.mustache.render(this.options.labelTemplate, this.addHelpers(res));
    };

    BaseFacet.prototype.renderNext = function(res) {};

    return BaseFacet;

  })(Display);

  module.exports = BaseFacet;

}).call(this);
