(function() {
  var $, BaseFacet, TermFacet, extend,
    extend1 = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  BaseFacet = require("./basefacet");

  extend = require("extend");

  $ = require("../../util/dfdom");


  /**
   * Represents a terms selector control to filter by the possible values of a
   * text field.
   */

  TermFacet = (function(superClass) {
    extend1(TermFacet, superClass);

    function TermFacet() {
      return TermFacet.__super__.constructor.apply(this, arguments);
    }

    TermFacet.defaultLabelTemplate = "{{label}}{{#total_selected}} ({{total_selected}}){{/total_selected}}";

    TermFacet.defaultTemplate = "<ul>\n  {{#terms}}\n  <li>\n    <a href=\"#\" data-facet=\"{{name}}\" data-value=\"{{key}}\" {{#selected}}data-selected{{/selected}}>\n      {{ key }} <span>{{ doc_count }}</span>\n    </a>\n  </li>\n  {{/terms}}\n</ul>";


    /**
     * Initializes the object with a controller and attachs event handlers for
     * this widget instance.
     *
     * @param  {Controller} controller Doofinder Search controller.
     */

    TermFacet.prototype.init = function(controller) {
      TermFacet.__super__.init.apply(this, arguments);
      return this.element.on("click", "[data-facet='" + this.name + "'][data-value]", (function(_this) {
        return function(e) {
          var clickInfo, key, termNode, value, wasSelected;
          e.preventDefault();
          termNode = $(e.target);
          value = termNode.data("value");
          key = termNode.data("facet");
          wasSelected = e.target.hasAttribute("data-selected");
          if (!wasSelected) {
            termNode.attr("data-selected", "");
            _this.controller.addFilter(key, value);
          } else {
            termNode.removeAttr("data-selected");
            _this.controller.removeFilter(key, value);
          }
          _this.controller.refresh();
          clickInfo = {
            widget: _this,
            termNode: termNode.element[0],
            facetName: key,
            facetValue: value,
            isSelected: !wasSelected
          };
          return _this.trigger("df:term_clicked", [clickInfo]);
        };
      })(this));
    };


    /**
     * @return {DfDomElement} Collection of selected term nodes.
     */

    TermFacet.prototype.getSelectedElements = function() {
      return this.element.find("[data-facet][data-selected]");
    };


    /**
     * @return {Number} Number of selected term nodes.
     */

    TermFacet.prototype.countSelectedElements = function() {
      return this.getSelectedElements().length();
    };


    /**
     * @param  {Object} res Results response from the server.
     * @return {Number}     Total terms used for filter.
     */

    TermFacet.prototype.countSelectedTerms = function(res) {
      var ref, ref1;
      return (((ref = res.filter) != null ? (ref1 = ref.terms) != null ? ref1[this.name] : void 0 : void 0) || []).length;
    };


    /**
     * Renders the label of the facet widget based on the given search response,
     * within the configured label template. The number of selected terms is
     * passed to the context so it can be used in the template.
     *
     * @param  {Object} res Search response.
     * @return {String}     The rendered label.
     */

    TermFacet.prototype.renderLabel = function(res) {
      return TermFacet.__super__.renderLabel.call(this, extend(true, res, {
        total_selected: this.countSelectedTerms(res)
      }));
    };


    /**
     * Called when the "first page" response for a specific search is received.
     * Renders the widget with the data received, by replacing its content.
     *
     * @param {Object} res Search response.
     * @fires TermFacet#df:rendered
     */

    TermFacet.prototype.render = function(res) {
      var context, i, index, len, ref, ref1, ref2, ref3, selectedTerms, term, totalSelected;
      if (!res.facets || !res.facets[this.name]) {
        this.raiseError("TermFacet: " + this.name + " facet is not configured");
      } else if (!res.facets[this.name].terms.buckets) {
        this.raiseError("TermFacet: " + this.name + " facet is not a terms facet");
      }
      if (res.facets[this.name].terms.buckets.length > 0) {
        selectedTerms = {};
        ref2 = ((ref = res.filter) != null ? (ref1 = ref.terms) != null ? ref1[this.name] : void 0 : void 0) || [];
        for (i = 0, len = ref2.length; i < len; i++) {
          term = ref2[i];
          selectedTerms[term] = true;
        }
        selectedTerms;
        ref3 = res.facets[this.name].terms.buckets;
        for (index in ref3) {
          term = ref3[index];
          term.index = index;
          term.name = this.name;
          if (selectedTerms[term.key]) {
            term.selected = 1;
          } else {
            term.selected = 0;
          }
        }
        totalSelected = this.countSelectedTerms(res);
        context = extend(true, {
          any_selected: totalSelected > 0,
          total_selected: totalSelected,
          name: this.name,
          terms: res.facets[this.name].terms.buckets
        }, this.extraContext || {});
        this.element.html(this.mustache.render(this.template, this.addHelpers(context)));
        return this.trigger("df:rendered", [res]);
      } else {
        return this.clean();
      }
    };

    return TermFacet;

  })(BaseFacet);

  module.exports = TermFacet;

}).call(this);
