(function() {
  var $, Display, INSERTION_METHODS, Panel, defaultTemplate, extend, uniqueId,
    extend1 = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  extend = require("extend");

  Display = require("./display");

  $ = require("../util/dfdom");

  uniqueId = require("../util/uniqueid");

  INSERTION_METHODS = ["prepend", "append", "before", "after", "html"];

  defaultTemplate = "<div class=\"df-panel\" id=\"{{panelElement}}\">\n  {{#label}}\n  <div class=\"df-panel__label\" id=\"{{labelElement}}\">{{label}}</div>\n  {{/label}}\n  <div class=\"df-panel__content\" id=\"{{contentElement}}\"></div>\n</div>";

  Panel = (function(superClass) {
    extend1(Panel, superClass);

    function Panel(element, getWidget, options) {
      var defaults, ref;
      this.getWidget = getWidget;
      if (options == null) {
        options = {};
      }
      defaults = {
        templateVars: {
          label: null,
          panelElement: "df-" + (uniqueId.generate.easy()),
          labelElement: "df-" + (uniqueId.generate.easy()),
          contentElement: "df-" + (uniqueId.generate.easy())
        },
        insertionMethod: "append",
        template: defaultTemplate
      };
      options = extend(true, defaults, options);
      if (ref = options.insertionMethod, indexOf.call(INSERTION_METHODS, ref) < 0) {
        options.insertionMethod = "append";
      }
      Panel.__super__.constructor.call(this, element, options);
      this.panelElement = null;
      this.labelElement = null;
      this.contentElement = null;
      this.rendered = false;
    }

    Panel.prototype.render = function(res) {
      if (!this.rendered) {
        this.rendered = true;
        this.element[this.options.insertionMethod](this.renderTemplate(res));
        this.initPanel(res);
        this.renderContent(res);
        this.trigger("df:widget:render", [res]);
        return this.trigger("df:rendered", [res]);
      }
    };

    Panel.prototype.initPanel = function(res) {
      this.panelElement = $("#" + this.options.templateVars.panelElement);
      this.labelElement = $("#" + this.options.templateVars.labelElement);
      return this.contentElement = $("#" + this.options.templateVars.contentElement);
    };

    Panel.prototype.renderContent = function(res) {
      var widget;
      widget = this.getWidget(this);
      widget.one("df:widget:render", (function(res) {
        return this.trigger("df:widget:renderContent", widget);
      }).bind(this));
      this.controller.registerWidget(widget);
      return widget.render(res);
    };

    Panel.prototype.clean = function() {
      if (this.rendered) {
        this.trigger("df:widget:clean");
        return this.trigger("df:cleaned");
      }
    };

    return Panel;

  })(Display);

  module.exports = Panel;

}).call(this);
