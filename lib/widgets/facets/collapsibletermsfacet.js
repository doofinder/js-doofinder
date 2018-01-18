(function() {
  var $, CollapsibleTermsFacet, TermsFacet, extend,
    extend1 = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  extend = require("extend");

  TermsFacet = require("./termsfacet");

  $ = require("../../util/dfdom");


  /**
   * Represents a terms selector control to filter by the possible values of a
   * text field.
   */

  CollapsibleTermsFacet = (function(superClass) {
    extend1(CollapsibleTermsFacet, superClass);

    CollapsibleTermsFacet.defaultTemplate = "{{#terms}}\n  <div class=\"df-term\" data-facet=\"{{name}}\" data-value=\"{{key}}\"\n      {{#extra-content}}{{index}}{{/extra-content}}\n      {{#selected}}data-selected{{/selected}}>\n    <span class=\"df-term__value\">{{key}}</span>\n    <span class=\"df-term__count\">{{doc_count}}</span>\n  </div>\n{{/terms}}\n{{#show-more-button}}{{terms.length}}{{/show-more-button}}";

    CollapsibleTermsFacet.defaultButtonTemplate = "<button type=\"button\" data-toggle-extra-content\n    data-text-normal=\"{{#translate}}{{viewMoreLabel}}{{/translate}}\"\n    data-text-toggle=\"{{#translate}}{{viewLessLabel}}{{/translate}}\">\n  {{#collapsed}}{{#translate}}{{viewMoreLabel}}{{/translate}}{{/collapsed}}\n  {{^collapsed}}{{#translate}}{{viewLessLabel}}{{/translate}}{{/collapsed}}\n</button>";


    /**
     * @param  {String|Node|DfDomElement} element  Container node.
     * @param  {String} facet Name of the facet/filter.
     * @param  {Object} options
     */

    function CollapsibleTermsFacet(element, facet, options) {
      var defaults;
      if (options == null) {
        options = {};
      }
      defaults = {
        size: 10,
        startCollapsed: true,
        buttonTemplate: this.constructor.defaultButtonTemplate,
        templateVars: {
          viewMoreLabel: "View more…",
          viewLessLabel: "View less…"
        },
        templateFunctions: {
          "extra-content": (function(_this) {
            return function() {

              /**
               * Returns `data-extra-content` if the (0-based) index is greater
               * than or equal to the size passed.
               *
               * Index and size are passed as text and must be parsed:
               *
               * {{#extra-content}}{{index}}:{{size}}{{/extra-content}}
               *
               * @param  {string}   text
               * @param  {Function} render
               * @return {string}   "data-extra-content" or ""
               */
              return function(text, render) {
                var i;
                i = parseInt(render(text), 10);
                if ((_this.options.size != null) && i >= _this.options.size) {
                  return "data-extra-content";
                } else {
                  return "";
                }
              };
            };
          })(this),
          "show-more-button": (function(_this) {
            return function() {

              /**
               * Renders a `View More` button if the length is greater than the
               * size passed.
               *
               * {{#show-more-button}}{{length}}:{{size}}{{/show-more-button}}
               *
               * @param  {string}   text
               * @param  {Function} render
               * @return {string}   Rendered button or "".
               */
              return function(text, render) {
                var len;
                len = parseInt(render(text), 10);
                if ((_this.options.size != null) && len > _this.options.size) {
                  return _this.mustache.render(_this.options.buttonTemplate, _this.currentContext);
                } else {
                  return "";
                }
              };
            };
          })(this)
        }
      };
      CollapsibleTermsFacet.__super__.constructor.call(this, element, facet, extend(true, defaults, options));
      Object.defineProperty(this, 'isCollapsed', {
        get: (function(_this) {
          return function() {
            return !_this.element.hasAttr("data-view-extra-content");
          };
        })(this)
      });
      this.totalSelected = 0;
    }


    /**
     * Initializes the object with a controller and attachs event handlers for
     * this widget instance.
     *
     * @param  {Controller} controller Doofinder Search controller.
     */

    CollapsibleTermsFacet.prototype.init = function() {
      if (!this.initialized) {
        this.__updateElement(this.options.startCollapsed);
        this.element.on("click", "[data-toggle-extra-content]", (function(_this) {
          return function(e) {
            e.preventDefault();
            return _this.toggle();
          };
        })(this));
      }
      return CollapsibleTermsFacet.__super__.init.apply(this, arguments);
    };


    /**
     * @return {HTMLElement} The "show more" button.
     */

    CollapsibleTermsFacet.prototype.__getButton = function() {
      return (this.element.find("[data-toggle-extra-content]")).first();
    };

    CollapsibleTermsFacet.prototype.__updateButton = function(collapsed) {
      var att, btn;
      btn = this.__getButton();
      att = collapsed ? "data-text-normal" : "data-text-toggle";
      return (btn.get(0)).textContent = (btn.attr(att)).trim();
    };

    CollapsibleTermsFacet.prototype.__updateElement = function(collapsed) {
      if (collapsed) {
        return this.element.removeAttr("data-view-extra-content");
      } else {
        return this.element.attr("data-view-extra-content", "");
      }
    };

    CollapsibleTermsFacet.prototype.collapse = function() {
      if (!this.isCollapsed) {
        this.__updateButton(true);
        this.__updateElement(true);
        return this.trigger("df:collapse:change", [true]);
      }
    };

    CollapsibleTermsFacet.prototype.expand = function() {
      if (this.isCollapsed) {
        this.__updateButton(false);
        this.__updateElement(false);
        return this.trigger("df:collapse:change", [false]);
      }
    };

    CollapsibleTermsFacet.prototype.toggle = function() {
      if (this.isCollapsed) {
        return this.expand();
      } else {
        return this.collapse();
      }
    };

    CollapsibleTermsFacet.prototype.reset = function() {
      if (this.options.startCollapsed) {
        return this.collapse();
      } else {
        return this.expand();
      }
    };


    /**
     * Adds extra context to the passed context object.
     *
     * @param  {Object} response = {} Search response as initial context.
     * @return {Object}               Extended search response.
     * @protected
     */

    CollapsibleTermsFacet.prototype.__buildContext = function(response) {
      if (response == null) {
        response = {};
      }
      CollapsibleTermsFacet.__super__.__buildContext.apply(this, arguments);
      return this.currentContext = extend(true, this.currentContext, {
        size: this.options.size,
        collapsed: this.isCollapsed
      });
    };

    CollapsibleTermsFacet.prototype.clean = function() {
      this.reset();
      return CollapsibleTermsFacet.__super__.clean.apply(this, arguments);
    };

    return CollapsibleTermsFacet;

  })(TermsFacet);

  module.exports = CollapsibleTermsFacet;

}).call(this);
