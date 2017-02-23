
/*
termfacet.coffee
author: @ecoslado
2015 11 10
 */

(function() {
  var $, Display, TermFacet, extend,
    extend1 = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Display = require("../display");

  extend = require("extend");

  $ = require("../../util/dfdom");


  /*
  TermFacet
  This class receives a facet terms and
  paint them. Manages the filtering.
   */

  TermFacet = (function(superClass) {
    extend1(TermFacet, superClass);

    function TermFacet(element, name, options) {
      var template;
      this.name = name;
      if (options == null) {
        options = {};
      }
      if (!options.template) {
        template = "{{#@index}}\n  <hr class=\"df-separator\">\n{{/@index}}\n<div class=\"df-panel\">\n  <a href=\"#\" class=\"df-panel__title\" data-toggle=\"panel\">{{label}}</a>\n  <div class=\"df-panel__content\">\n    <ul>\n      {{#terms}}\n      <li>\n        <a href=\"#\" class=\"df-facet {{#selected}}df-facet--active{{/selected}}\"\n            data-facet=\"{{name}}\" data-value=\"{{ key }}\" {{#selected}}data-selected{{/selected}}>\n          {{ key }}\n          <span class=\"df-facet__count\">{{ doc_count }}</span>\n        </a>\n      </li>\n      {{/terms}}\n    </ul>\n  </div>\n</div>";
      } else {
        template = options.template;
      }
      TermFacet.__super__.constructor.call(this, element, template, options);
    }

    TermFacet.prototype.init = function(controller) {
      var self;
      TermFacet.__super__.init.call(this, controller);
      self = this;
      return this.element.on('click', "[data-facet='" + this.name + "']", function(e) {
        var key, value;
        e.preventDefault();
        value = $(this).data('value');
        key = $(this).data('facet');
        if (!this.hasAttribute('data-selected')) {
          this.setAttribute('data-selected', '');
          self.controller.addFilter(key, value);
        } else {
          this.removeAttribute('data-selected');
          self.controller.removeFilter(key, value);
        }
        return self.controller.refresh();
      });
    };

    TermFacet.prototype.render = function(res) {
      var context, i, index, len, ref, ref1, ref2, ref3, selectedTerms, selected_length, term;
      if (!res.facets || !res.facets[this.name]) {
        this.raiseError("TermFacet: " + this.name + " facet is not configured");
      } else if (!res.facets[this.name].terms.buckets) {
        this.raiseError("TermFacet: " + this.name + " facet is not a terms facet");
      }
      selectedTerms = {};
      ref2 = ((ref = res.filter) != null ? (ref1 = ref.terms) != null ? ref1[this.name] : void 0 : void 0) || [];
      for (i = 0, len = ref2.length; i < len; i++) {
        term = ref2[i];
        selectedTerms[term] = true;
      }
      if (res.results) {
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
        selected_length = Object.keys(selectedTerms).length;
        context = extend(true, {
          any_selected: selected_length > 0,
          total_selected: selected_length,
          name: this.name,
          terms: res.facets[this.name].terms.buckets
        }, this.extraContext || {});
        this.addHelpers(context);
        this.element.html(this.mustache.render(this.template, context));
      } else {
        this.element.html('');
      }
      return this.trigger('df:rendered', [res]);
    };

    TermFacet.prototype.renderNext = function() {};

    return TermFacet;

  })(Display);

  module.exports = TermFacet;

}).call(this);
