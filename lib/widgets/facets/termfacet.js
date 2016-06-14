
/*
termfacet.coffee
author: @ecoslado
2015 11 10
 */

(function() {
  var $, Display, TermFacet,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Display = require("../display");

  $ = require("jquery");


  /*
  TermFacet
  This class receives a facet terms and
  paint them. Manages the filtering.
   */

  TermFacet = (function(superClass) {
    extend(TermFacet, superClass);

    function TermFacet(container, name, options) {
      var template;
      this.name = name;
      if (options == null) {
        options = {};
      }
      this.selected = {};
      if (!options.template) {
        template = "{{#@index}}\n  <hr class=\"df-separator\">\n{{/@index}}\n<div class=\"df-panel\">\n  <a href=\"#\" class=\"df-panel__title\" data-toggle=\"panel\">{{label}}</a>\n  <div class=\"df-panel__content\">\n    <ul>\n      {{#terms}}\n      <li>\n        <a href=\"#\" class=\"df-facet {{#selected}}df-facet--active{{/selected}}\"\n            data-facet=\"{{name}}\" data-value=\"{{ key }}\">\n          {{ key }}\n          <span class=\"df-facet__count\">{{ doc_count }}</span>\n        </a>\n      </li>\n      {{/terms}}\n    </ul>\n  </div>\n</div>";
      } else {
        template = options.template;
      }
      TermFacet.__super__.constructor.call(this, container, template, options);
    }

    TermFacet.prototype.init = function(controller) {
      var self;
      TermFacet.__super__.init.call(this, controller);
      self = this;
      this.controller.bind("df:search", function(params) {
        return self.selected = {};
      });
      $(this.container).on('click', "a[data-facet='" + this.name + "']", function(e) {
        var key, termFacet, value;
        e.preventDefault();
        termFacet = $(this);
        value = termFacet.data("value");
        key = termFacet.data("facet");
        if (self.selected[value]) {
          delete self.selected[value];
          self.controller.removeFilter(key, value);
        } else {
          self.selected[value] = true;
          self.controller.addFilter(key, value);
        }
        return self.controller.refresh();
      });
      return this.controller.bind("df:results_received", function(res) {
        var ref, results, selected, term, terms;
        if (res.facets[self.name] != null) {
          terms = res.facets[self.name].terms.buckets.map(function(term) {
            return term.key;
          });
        } else {
          terms = [];
        }
        ref = self.selected;
        results = [];
        for (term in ref) {
          selected = ref[term];
          if (selected && !terms.indexOf(term) < 0) {
            delete self.selected[term];
            results.push(self.controller.removeFilter(self.name, term));
          } else {
            results.push(void 0);
          }
        }
        return results;
      });
    };

    TermFacet.prototype.render = function(res) {
      var context, html, index, ref, term;
      if (!res.facets || !res.facets[this.name]) {
        this.raiseError("TermFacet: " + this.name + " facet is not configured");
      } else if (!res.facets[this.name].terms.buckets) {
        this.raiseError("TermFacet: " + this.name + " facet is not a terms facet");
      }
      if (res.results) {
        ref = res.facets[this.name].terms.buckets;
        for (index in ref) {
          term = ref[index];
          term.index = index;
          term.name = this.name;
          if (this.selected[term.key]) {
            term.selected = 1;
          } else {
            term.selected = 0;
          }
        }
        context = $.extend(true, {
          any_selected: this.selected.length > 0,
          total_selected: this.selected.length,
          name: this.name,
          terms: res.facets[this.name].terms.buckets
        }, this.extraContext || {});
        this.addHelpers(context);
        html = this.mustache.render(this.template, context);
        $(this.container).html(html);
      } else {
        $(this.container).html('');
      }
      return this.trigger('df:rendered', [res]);
    };

    TermFacet.prototype.renderNext = function() {};

    return TermFacet;

  })(Display);

  module.exports = TermFacet;

}).call(this);
