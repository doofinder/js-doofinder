
/*
rangefacet.coffee
author: @ecoslado
2015 11 10
 */


/*
RangeFacet
This class receives a facet ranges and paint
them. Manages the filtering.
 */

(function() {
  var $, Display, RangeFacet, jQuery,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Display = require("../display");

  $ = jQuery = require("../../util/jquery");

  RangeFacet = (function(superClass) {
    extend(RangeFacet, superClass);

    function RangeFacet(container, name, options) {
      var template;
      this.name = name;
      if (options == null) {
        options = {};
      }
      if (!options.template) {
        template = '<div class="df-panel df-widget" data-facet="{{name}}">' + '<a href="#" class="df-panel__title" data-toggle="panel">{{label}}</a>' + '<div class="df-panel__content">' + '<input class="df-facet" type="text" name="{{name}}" value=""' + 'data-facet="{{name}}">' + '</div>' + '</div>';
      } else {
        template = options.template;
      }
      this.sliderOptions = options.sliderOptions;
      RangeFacet.__super__.constructor.call(this, container, template, options);
    }

    RangeFacet.prototype.render = function(res) {
      var _this, context, facet, html, range;
      if (!res.facets || !res.facets[this.name]) {
        throw Error("Error in RangeFacet: " + this.name + " facet is not configured.");
      } else if (!res.facets[this.name].range) {
        throw Error("Error in RangeFacet: " + this.name + " facet is not a range facet.");
      }
      _this = this;
      if (res.total > 0) {
        context = $.extend(true, {
          name: this.name
        }, this.extraContext || {});
        html = this.mustache.render(this.template, context);
        $(this.container).html(html);
        range = {
          type: "double",
          min: parseFloat(res.facets[this.name].range.buckets[0].stats.min, 10),
          from: parseFloat(res.facets[this.name].range.buckets[0].stats.min, 10),
          max: parseFloat(res.facets[this.name].range.buckets[0].stats.max, 10),
          to: parseFloat(res.facets[this.name].range.buckets[0].stats.max, 10),
          force_edges: true,
          prettify_enabled: true,
          hide_min_max: true,
          grid: true,
          grid_num: 2,
          onFinish: function(data) {
            _this.controller.addFilter(_this.name, {
              'lte': data.to,
              'gte': data.from
            });
            return _this.controller.refresh();
          }
        };
        range = $.extend(true, range, _this.sliderOptions || {});
        if (res && res.filter && res.filter.range && res.filter.range[this.name] && parseInt(res.filter.range[this.name].gte)) {
          range.from = parseInt(res.filter.range[this.name].gte, 10);
        }
        if (res && res.filter && res.filter.range && res.filter.range[this.name] && parseInt(res.filter.range[this.name].lte)) {
          range.to = parseInt(res.filter.range[this.name].lte, 10);
        }
        facet = $("input[data-facet='" + this.name + "']");
        facet.ionRangeSlider(range);
        return this.trigger('df:rendered', [res]);
      } else {
        return $(this.container).html("");
      }
    };

    RangeFacet.prototype.renderNext = function() {};

    return RangeFacet;

  })(Display);

  module.exports = RangeFacet;

}).call(this);
