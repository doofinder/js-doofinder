(function() {
  var $, Display, TermsFacet, defaultButtonTemplate, defaultTemplate, extend,
    extend1 = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  extend = require("extend");

  Display = require("../display");

  $ = require("../../util/dfdom");

  defaultTemplate = "{{#terms}}\n  <div class=\"df-term\" data-facet=\"{{name}}\" data-value=\"{{key}}\"\n      {{#extra-content}}{{index}}{{/extra-content}}\n      {{#selected}}data-selected{{/selected}}>\n    <span class=\"df-term__value\">{{key}}</span>\n    <span class=\"df-term__count\">{{doc_count}}</span>\n  </div>\n{{/terms}}\n{{#show-more-button}}{{terms.length}}{{/show-more-button}}";

  defaultButtonTemplate = "<button type=\"button\" data-toggle-extra-content\n    data-text-normal=\"{{#translate}}{{viewMoreLabel}}{{/translate}}\"\n    data-text-toggle=\"{{#translate}}{{viewLessLabel}}{{/translate}}\">\n  {{#translate}}\n    {{#collapsed}}{{viewMoreLabel}}{{/collapsed}}\n    {{^collapsed}}{{viewLessLabel}}{{/collapsed}}\n  {{/translate}}\n</button>";


  /**
   * Represents a terms selector control to filter by the possible values of a
   * text field.
   */

  TermsFacet = (function(superClass) {
    extend1(TermsFacet, superClass);


    /**
     * @param  {String|Node|DfDomElement} element  Container node.
     * @param  {String} facet    Name of the facet/filter.
     * @param  {Object} options Options object. Empty by default.
     */

    function TermsFacet(element, facet, options) {
      var defaults;
      this.facet = facet;
      if (options == null) {
        options = {};
      }
      defaults = {
        size: null,
        template: defaultTemplate,
        buttonTemplate: defaultButtonTemplate,
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
                var context, len;
                len = parseInt(render(text), 10);
                if ((_this.options.size != null) && len > _this.options.size) {
                  context = extend(true, {
                    collapsed: _this.collapsed
                  }, _this.currentContext);
                  return _this.mustache.render(_this.options.buttonTemplate, context);
                } else {
                  return "";
                }
              };
            };
          })(this)
        }
      };
      TermsFacet.__super__.constructor.call(this, element, extend(true, defaults, options));
      this.collapsed = this.options.size != null;
      this.totalSelected = 0;
    }


    /**
     * Initializes the object with a controller and attachs event handlers for
     * this widget instance.
     *
     * @param  {Controller} controller Doofinder Search controller.
     */

    TermsFacet.prototype.init = function() {
      if (!this.initialized) {
        this.element.on("click", "[data-facet='" + this.facet + "'][data-value]", (function(_this) {
          return function(e) {
            var facetName, facetValue, isSelected, termNode;
            e.preventDefault();
            termNode = $(e.currentTarget);
            facetName = termNode.data("facet");
            facetValue = termNode.data("value");
            isSelected = !termNode.hasAttr("data-selected");
            if (isSelected) {
              _this.totalSelected++;
              termNode.attr("data-selected", "");
              _this.controller.addFilter(facetName, facetValue);
            } else {
              _this.totalSelected--;
              termNode.removeAttr("data-selected");
              _this.controller.removeFilter(facetName, facetValue);
            }
            _this.controller.refresh();
            _this.trigger("df:term:click", [facetName, facetValue, isSelected]);
            return _this.trigger("df:term_clicked", [
              {
                facetName: facetName,
                facetValue: facetValue,
                selected: isSelected,
                totalSelected: _this.totalSelected
              }
            ]);
          };
        })(this));
        if (this.options.size != null) {
          this.element.on("click", "[data-toggle-extra-content]", (function(_this) {
            return function(e) {
              e.preventDefault();
              return _this.toggleExtraContent();
            };
          })(this));
        }
      }
      return TermsFacet.__super__.init.apply(this, arguments);
    };

    TermsFacet.prototype.toggleExtraContent = function() {
      var btn, labelAttr;
      if (this.collapsed) {
        labelAttr = "data-text-toggle";
        this.element.attr("data-view-extra-content", "");
      } else {
        labelAttr = "data-text-normal";
        this.element.removeAttr("data-view-extra-content");
      }
      btn = this.getButton();
      (btn.get(0)).textContent = (btn.attr(labelAttr)).trim();
      this.collapsed = !this.collapsed;
      return this.trigger("df:collapse:change", [this.collapsed]);
    };


    /**
     * @return {HTMLElement} The "show more" button.
     */

    TermsFacet.prototype.getButton = function() {
      return (this.element.find("[data-toggle-extra-content]")).first();
    };


    /**
     * Renders the widget with the data received, by replacing its content.
     *
     * @param {Object} res Search response.
     * @fires TermsFacet#df:widget:render
     */

    TermsFacet.prototype.render = function(res) {
      var context, index, ref, ref1, ref2, selectedTerms, term, terms;
      if (res.page === 1) {
        terms = res.facets[this.facet].terms.buckets;
        if (terms.length > 0) {
          selectedTerms = (res != null ? (ref = res.filter) != null ? (ref1 = ref.terms) != null ? ref1[this.facet] : void 0 : void 0 : void 0) || [];
          this.totalSelected = selectedTerms.length;
          for (index in terms) {
            term = terms[index];
            term.index = parseInt(index, 10);
            term.name = this.facet;
            term.selected = (ref2 = term.key, indexOf.call(selectedTerms, ref2) >= 0);
          }
          context = {
            name: this.facet,
            terms: terms,
            size: this.options.size
          };
          return TermsFacet.__super__.render.call(this, extend(true, {}, res, context));
        } else {
          return this.clean();
        }
      } else {
        return false;
      }
    };

    TermsFacet.prototype.clean = function() {
      this.totalSelected = 0;
      return TermsFacet.__super__.clean.apply(this, arguments);
    };

    return TermsFacet;

  })(Display);

  module.exports = TermsFacet;

}).call(this);
