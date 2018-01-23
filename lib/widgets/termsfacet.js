(function() {
  var $, Display, TermsFacet, extend,
    extend1 = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  extend = require("extend");

  Display = require("./display");

  $ = require("../util/dfdom");


  /**
   * Represents a terms selector control to filter by the possible values of a
   * text field.
   */

  TermsFacet = (function(superClass) {
    extend1(TermsFacet, superClass);

    TermsFacet.defaultTemplate = "{{#terms}}\n  <div class=\"df-term\" data-facet=\"{{name}}\" data-value=\"{{key}}\"\n      {{#selected}}data-selected{{/selected}}>\n    <span class=\"df-term__value\">{{key}}</span>\n    <span class=\"df-term__count\">{{doc_count}}</span>\n  </div>\n{{/terms}}";


    /**
     * @param  {String|Node|DfDomElement} element  Container node.
     * @param  {String} facet Name of the facet/filter.
     * @param  {Object} options
     */

    function TermsFacet(element, facet, options) {
      this.facet = facet;
      if (options == null) {
        options = {};
      }
      TermsFacet.__super__.constructor.call(this, element, extend(true, {
        template: this.constructor.defaultTemplate
      }, options));
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
        this.element.on("click", "[data-facet=\"" + this.facet + "\"][data-value]", (function(_this) {
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
            return _this.trigger("df:term:click", [facetName, facetValue, isSelected]);
          };
        })(this));
      }
      return TermsFacet.__super__.init.apply(this, arguments);
    };


    /**
     * Adds extra context to the passed context object.
     *
     * @param  {Object} response = {} Search response as initial context.
     * @return {Object}               Extended search response.
     * @protected
     */

    TermsFacet.prototype.__buildContext = function(response) {
      var index, ref, ref1, ref2, selectedTerms, term, terms;
      if (response == null) {
        response = {};
      }
      TermsFacet.__super__.__buildContext.apply(this, arguments);
      terms = response.facets[this.facet].terms.buckets;
      selectedTerms = (response != null ? (ref = response.filter) != null ? (ref1 = ref.terms) != null ? ref1[this.facet] : void 0 : void 0 : void 0) || [];
      for (index in terms) {
        term = terms[index];
        term.index = parseInt(index, 10);
        term.name = this.facet;
        term.selected = (ref2 = term.key, indexOf.call(selectedTerms, ref2) >= 0);
      }
      this.totalSelected = selectedTerms.length;
      return this.currentContext = extend(true, this.currentContext, {
        name: this.facet,
        terms: terms
      });
    };


    /**
     * Renders the widget with the data received, by replacing its content.
     *
     * @param {Object} res Search response.
     * @fires TermsFacet#df:widget:render
     */

    TermsFacet.prototype.render = function(res) {
      if (res.page === 1) {
        if (res.facets[this.facet].terms.buckets.length > 0) {
          return TermsFacet.__super__.render.call(this, res);
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
