(function() {
  var CollapsiblePanel, Panel, extend,
    extend1 = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  extend = require("extend");

  Panel = require("./panel");

  CollapsiblePanel = (function(superClass) {
    extend1(CollapsiblePanel, superClass);

    function CollapsiblePanel(element, getWidget, options) {
      var defaults;
      if (options == null) {
        options = {};
      }
      defaults = {
        templateVars: {
          label: "Untitled"
        },
        startCollapsed: false
      };
      options = extend(true, defaults, options);
      CollapsiblePanel.__super__.constructor.call(this, element, getWidget, options);
      Object.defineProperty(this, 'isCollapsed', {
        get: function() {
          return (this.panelElement.attr("data-df-collapse")) === "true";
        }
      });
    }

    CollapsiblePanel.prototype.collapse = function() {
      if (this.rendered) {
        this.panelElement.attr("data-df-collapse", "true");
        return this.trigger("df:collapse:change", [true]);
      }
    };

    CollapsiblePanel.prototype.expand = function() {
      if (this.rendered) {
        this.panelElement.attr("data-df-collapse", "false");
        return this.trigger("df:collapse:change", [false]);
      }
    };

    CollapsiblePanel.prototype.toggle = function() {
      if (this.rendered) {
        if (this.isCollapsed) {
          return this.expand();
        } else {
          return this.collapse();
        }
      }
    };

    CollapsiblePanel.prototype.reset = function() {
      if (this.rendered) {
        if (this.options.startCollapsed) {
          return this.collapse();
        } else {
          return this.expand();
        }
      }
    };

    CollapsiblePanel.prototype.initPanel = function(res) {
      CollapsiblePanel.__super__.initPanel.apply(this, arguments);
      this.panelElement.on("click", "#" + this.options.templateVars.labelElement, (function(_this) {
        return function(e) {
          e.preventDefault();
          return _this.toggle();
        };
      })(this));
      return this.reset();
    };

    CollapsiblePanel.prototype.clean = function() {
      this.reset();
      return CollapsiblePanel.__super__.clean.apply(this, arguments);
    };

    return CollapsiblePanel;

  })(Panel);

  module.exports = CollapsiblePanel;

}).call(this);
