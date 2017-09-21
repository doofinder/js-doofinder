(function() {
  var $, Display, FacetPanel, defaultTemplate, extend, uniqueId,
    extend1 = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  extend = require("extend");

  $ = require("../../util/dfdom");

  Display = require("../display");

  uniqueId = require("../../util/uniqueid");

  defaultTemplate = "<div id=\"{{id}}\" data-role=\"panel\">\n  <a href=\"#\" data-role=\"panel-label\" data-toggle=\"panel\"></a>\n  <div data-role=\"panel-content\"></div>\n</div>";


  /**
   * Collapsible panel that contains a facet widget.
   * It's always appended to a container element, it does not replace the entire
   * HTML content.
   */

  FacetPanel = (function(superClass) {
    extend1(FacetPanel, superClass);


    /**
     * @param  {String|Node|DfDomElement} element  Container node.
     * @param  {Object} options Options object. Empty by default.
     */

    function FacetPanel(element, options) {
      var defaults, uid;
      if (options == null) {
        options = {};
      }
      uid = "df-panel-" + (uniqueId.generate.easy());
      defaults = {
        id: uid,
        template: defaultTemplate,
        startHidden: true,
        startCollapsed: false,
        templateVars: {
          id: options.id || uid
        }
      };
      options = extend(true, defaults, options);
      FacetPanel.__super__.constructor.call(this, element, options.template, options);
      this.element.append(this.renderTemplate());
      this.setElement("#" + this.options.id);
      this.toggleElement = (this.element.find('[data-toggle="panel"]')).first();
      this.labelElement = (this.element.find('[data-role="panel-label"]')).first();
      this.contentElement = (this.element.find('[data-role="panel-content"]')).first();
      this.clean();
    }


    /**
     * Initializes the object with a controller and attachs event handlers for
     * this widget instance.
     *
     * @param  {Controller} controller Doofinder Search controller.
     */

    FacetPanel.prototype.init = function() {
      if (!this.initialized) {
        this.toggleElement.on("click", (function(_this) {
          return function(e) {
            e.preventDefault();
            if (_this.isCollapsed()) {
              return _this.expand();
            } else {
              return _this.collapse();
            }
          };
        })(this));
        return FacetPanel.__super__.init.apply(this, arguments);
      }
    };


    /**
     * Checks whether the panel is collapsed or not.
     * @return {Boolean} `true` if the panel is collapsed, `false` otherwise.
     */

    FacetPanel.prototype.isCollapsed = function() {
      return (this.element.attr("data-collapse")) != null;
    };


    /**
     * Collapses the panel to hide its content.
     */

    FacetPanel.prototype.collapse = function() {
      return this.element.attr("data-collapse", "");
    };


    /**
     * Expands the panel to display its content.
     */

    FacetPanel.prototype.expand = function() {
      return this.element.removeAttr("data-collapse");
    };


    /**
     * Embeds one and only one widget into this panel content. If the panel is
     * rendered hidden (default), we listen for the first rendering of the
     * embedded widget and then we display it.
     *
     * @param  {Widget} embeddedWidget A (child) instance of `Widget`.
     */

    FacetPanel.prototype.embedWidget = function(embeddedWidget) {
      if (this.embeddedWidget != null) {
        return this.raiseError("You can embed only one item on a `FacetPanel` instance.");
      } else {
        this.embeddedWidget = embeddedWidget;
        this.embeddedWidget.on("df:widget:render", ((function(_this) {
          return function() {
            return _this.element.css("display", "inherit");
          };
        })(this)));
        return this.embeddedWidget.on("df:widget:clean", ((function(_this) {
          return function() {
            return _this.element.css("display", "none");
          };
        })(this)));
      }
    };


    /**
     * Called when the "first page" response for a specific search is received.
     * Renders the panel title with the label obtained from the embedded widget.
     * This method does not replace its own HTML code, only the HTML of specific
     * parts.
     *
     * @param {Object} res Search response.
     * @fires FacetPanel#df:widget:render
     */

    FacetPanel.prototype.render = function(res) {
      if (this.embeddedWidget != null) {
        this.labelElement.html(this.embeddedWidget.renderLabel(res));
        return this.trigger("df:widget:render", [res]);
      }
    };


    /**
     * Cleans the widget by removing the HTML inside the label element. Also, if
     * the panel starts hidden, it's hidden again. If the panel starts collapsed,
     * it's collapsed again.
     *
     * WARNING: DON'T CALL `super()` here. We don't want the panel container to
     * be reset!!!
     *
     * @fires FacetPanel#df:widget:clean
     */

    FacetPanel.prototype.clean = function() {
      this.labelElement.html("");
      if (this.options.startHidden) {
        this.element.css("display", "none");
      }
      if (this.options.startCollapsed) {
        this.collapse();
      } else {
        this.expand();
      }
      return this.trigger("df:widget:clean");
    };

    return FacetPanel;

  })(Display);

  module.exports = FacetPanel;

}).call(this);
