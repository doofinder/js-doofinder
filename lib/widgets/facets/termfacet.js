
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
      if (!options.template) {
        template = '{{#if @index}}' + '<hr class="df-separator">' + '{{/if}}' + '<div class="df-facets">' + '<a href="#" class="df-panel__title" data-toggle="panel">{{label}}</a>' + '<div class="df-facets__content">' + '<ul>' + '{{#each terms}}' + '<li>' + '<a href="#" class="df-facet {{#if selected}}df-facet--active{{/if}}" data-facet="{{../name}}"' + 'data-value="{{ term }}">{{ term }} <span' + 'class="df-facet__count">{{ count }}</span></a>' + '</li>' + '{{/each}}';
      } else {
        template = options.template;
      }
      TermFacet.__super__.constructor.call(this, container, template, options);
    }

    TermFacet.prototype.init = function(controller) {
      var _this;
      TermFacet.__super__.init.call(this, controller);
      _this = this;
      this.bind("df:search", function(params) {
        return _this.selected = {};
      });
      $(this.container).on('click', "a[data-facet='" + this.name + "']", function(e) {
        var key, termFacet, value;
        e.preventDefault();
        termFacet = $(this);
        value = termFacet.data("value");
        key = termFacet.data("facet");
        if (_this.selected[value]) {
          _this.controller.removeFilter(key, value);
        } else {
          _this.controller.addFilter(key, value);
        }
        return _this.controller.refresh();
      });
      return this.controller.bind("df:results_received", function(event, res) {
        var ref, results, selected, term, terms;
        terms = res.facets[_this.name].terms;
        ref = _this.selected;
        results = [];
        for (term in ref) {
          selected = ref[term];
          if (selected && !_this._termInResults(term, terms)) {
            _this.selected[term] = 0;
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
        if (term === elem.term) {
          return true;
        }
      }
      return false;
    };

    TermFacet.prototype.render = function(res) {
      var context, html, i, j, len, len1, ref, ref1, selected, term;
      if (!res.facets || !res.facets[this.name]) {
        throw Error("Error in TermFacet: " + this.name + " facet is not configured.");
      } else if (!res.facets[this.name].terms) {
        throw Error("Error in TermFacet: " + this.name + " facet is not a term facet.");
      }
      selected = {};
      if (res.filter && res.filter.terms && res.filter.terms[this.name]) {
        ref = res.filter.terms[this.name];
        for (i = 0, len = ref.length; i < len; i++) {
          term = ref[i];
          selected[term] = 1;
        }
      }
      if (res.results) {
        ref1 = res.facets[this.name].terms;
        for (j = 0, len1 = ref1.length; j < len1; j++) {
          term = ref1[j];
          if (selected[term.term]) {
            term.selected = 1;
          } else {
            term.selected = 0;
          }
        }
        context = $.extend(true, {
          name: this.name,
          terms: res.facets[this.name].terms
        }, this.extraContext || {});
        html = this.template(context);
        $(this.container).html(html);
        return this.trigger('df:rendered', [res]);
      } else {
        return $(this.container).html('');
      }
    };

    TermFacet.prototype.renderNext = function() {};

    return TermFacet;

  })(Display);

  module.exports = TermFacet;

}).call(this);
