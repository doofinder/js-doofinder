(function() {
  var $, Display, FacetPanel, extend, uid,
    extend1 = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  extend = require("extend");

  $ = require("../../util/dfdom");

  Display = require("../display");

  uid = require("../../util/uniqueid");


  /**
   * Collapsible panel that contains a facet widget.
   * It's always appended to a container element, it does not replace the entire
   * HTML content.
   */

  FacetPanel = (function(superClass) {
    extend1(FacetPanel, superClass);

    FacetPanel.defaultTemplate = "<div id=\"{{id}}\" data-role=\"panel\">\n  <a href=\"#\" data-role=\"panel-label\" data-toggle=\"panel\"></a>\n  <div data-role=\"panel-content\"></div>\n</div>";

    function FacetPanel(element, options) {
      var defaults;
      defaults = {
        id: "df-panel-" + (uid()),
        template: this.constructor.defaultTemplate,
        startCollapsed: false
      };
      options = extend(true, defaults, options);
      FacetPanel.__super__.constructor.call(this, element, options.template, options);
      this.element.append(this.mustache.render(this.template, {
        id: this.options.id
      }));
      this.setElement("#" + this.options.id);
      if (this.options.startCollapsed) {
        this.collapse();
      }
      this.toggleElement = (this.element.find('[data-toggle="panel"]')).first();
      this.labelElement = (this.element.find('[data-role="panel-label"]')).first();
      this.contentElement = (this.element.find('[data-role="panel-content"]')).first();
    }

    FacetPanel.prototype.init = function(controller) {
      this.controller = controller;
      return this.toggleElement.on("click", (function(_this) {
        return function(e) {
          e.preventDefault();
          if (_this.isCollapsed()) {
            return _this.expand();
          } else {
            return _this.collapse();
          }
        };
      })(this));
    };

    FacetPanel.prototype.isCollapsed = function() {
      return (this.element.attr("data-collapse")) != null;
    };

    FacetPanel.prototype.collapse = function() {
      return this.element.attr("data-collapse", "");
    };

    FacetPanel.prototype.expand = function() {
      return this.element.removeAttr("data-collapse");
    };


    /**
     * Embeds one and only one widget into this panel content.
     * @param  {Widget} embeddedWidget A (child) instance of `Widget`.
     */

    FacetPanel.prototype.embedWidget = function(embeddedWidget) {
      if (this.embeddedWidget != null) {
        return this.raiseError("You can embed only one item on a `FacetPanel` instance.");
      } else {
        this.embeddedWidget = embeddedWidget;
        return this.controller.addWidget(this.embeddedWidget);
      }
    };


    /**
     * Renders the panel title with the label obtained from the embedded widget.
     * @param  {Object} res Search response from the server.
     */

    FacetPanel.prototype.render = function(res) {
      if (this.embeddedWidget != null) {
        this.labelElement.html(this.embeddedWidget.renderLabel(res));
        return this.trigger("df:rendered", [res]);
      }
    };

    FacetPanel.prototype.renderNext = function(res) {};

    FacetPanel.prototype.clean = function() {};

    return FacetPanel;

  })(Display);

  module.exports = FacetPanel;

}).call(this);
