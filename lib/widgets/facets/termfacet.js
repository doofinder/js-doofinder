
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
        template = "{{#@index}}\n  <hr class=\"df-separator\">\n{{/@index}}\n<div class=\"df-panel\">\n  <a href=\"#\" class=\"df-panel__title\" data-toggle=\"panel\">{{label}}</a>\n  <div class=\"df-panel__content\">\n    <ul>\n      {{#terms}}\n      <li>\n        <a href=\"#\" class=\"df-facet {{#selected}}df-facet--active{{/selected}}\" data-facet=\"{{name}}\" data-value=\"{{ key }}\">\n          {{ key }}\n          <span class=\"df-facet__count\">{{ doc_count }}</span>\n        </a>\n      </li>\n      {{/terms}}\n    </ul>\n  </div>\n</div>";
      } else {
        template = options.template;
      }
      TermFacet.__super__.constructor.call(this, container, template, options);
    }

    TermFacet.prototype.init = function(controller) {
      var _name, _this;
      TermFacet.__super__.init.call(this, controller);
      _this = this;
      _name = this.name;
      this.controller.bind("df:search", function(params) {
        return _this.selected = {};
      });
      $(this.container).on('click', "a[data-facet='" + this.name + "']", function(e) {
        var key, termFacet, value;
        e.preventDefault();
        termFacet = $(this);
        value = termFacet.data("value");
        key = termFacet.data("facet");
        if (_this.selected[value]) {
          delete _this.selected[value];
          _this.controller.removeFilter(key, value);
        } else {
          _this.selected[value] = 1;
          _this.controller.addFilter(key, value);
        }
        return _this.controller.refresh();
      });
      return this.controller.bind("df:results_received", function(event, res) {
        var ref, results, selected, term, terms;
        terms = res.facets[_this.name].terms.buckets;
        ref = _this.selected;
        results = [];
        for (term in ref) {
          selected = ref[term];
          if (selected && !_this._termInResults(term, terms)) {
            _this.selected[term.key] = 0;
            results.push(_this.controller.removeFilter(_this.name, term));
          } else {
            results.push(void 0);
          }
        }
        return results;
      });
    };

    TermFacet.prototype._termInResults = function(term, terms) {
      var elem, i, len;
      for (i = 0, len = terms.length; i < len; i++) {
        elem = terms[i];
        if (term === elem.key) {
          return true;
        }
      }
      return false;
    };

    TermFacet.prototype.render = function(res) {
      var context, html, index, ref, term;
      if (!res.facets || !res.facets[this.name]) {
        throw Error("Error in TermFacet: " + this.name + " facet is not configured.");
      } else if (!res.facets[this.name].terms.buckets) {
        throw Error("Error in TermFacet: " + this.name + " facet is not a term facet.");
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
