
/*
termfacet.coffee
author: @ecoslado
2015 11 10
 */


/*
TermFacet
This class receives a facet terms and
paint them. Manages the filtering.
 */

(function() {
  var $, Display, TermFacet,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Display = require("../display");

  $ = require("jquery");

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
      return $(this.container).on('click', "a[data-facet='" + this.name + "']", function(e) {
        var key, termFacet, value;
        e.preventDefault();
        termFacet = $(e.toElement);
        value = termFacet.data("value");
        key = termFacet.data("facet");
        if (_this.selected[value]) {
          _this.controller.removeFilter(key, value);
          _this.selected[value] = 0;
        } else {
          _this.controller.addFilter(key, value);
          _this.selected[value] = 1;
        }
        return _this.controller.refresh();
      });
    };

    TermFacet.prototype.render = function(res) {
      var context, html, i, len, ref, term;
      if (!res.facets || !res.facets[this.name]) {
        throw Error("Error in TermFacet: " + this.name + " facet is not configured.");
      } else if (!res.facets[this.name].terms) {
        throw Error("Error in TermFacet: " + this.name + " facet is not a term facet.");
      }
      ref = res.facets[this.name].terms;
      for (i = 0, len = ref.length; i < len; i++) {
        term = ref[i];
        if (this.selected[term.term]) {
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
      try {
        return document.querySelector(this.container).innerHTML = html;
      } catch (_error) {
        throw Error(("widget.TermFacet[" + this.name + "]: Error while rendering.") + " The container you are trying to access does not already exist.");
      }
    };

    TermFacet.prototype.renderNext = function() {};

    return TermFacet;

  })(Display);

  module.exports = TermFacet;

}).call(this);
