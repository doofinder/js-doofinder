
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
  var $, Display, RangeFacet, jQuery, noUiSlider,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Display = require("../display");

  $ = jQuery = require("../../util/jquery");

  noUiSlider = require("nouislider");

  RangeFacet = (function(superClass) {
    extend(RangeFacet, superClass);

    function RangeFacet(container, name, options) {
      var template;
      this.name = name;
      if (options == null) {
        options = {};
      }
      if (!options.template) {
        template = "<div class=\"df-panel\" data-facet=\"{{name}}\">\n  <a href=\"#\" class=\"df-panel__title\" data-toggle=\"panel\">{{label}}</a>\n  <div class=\"df-panel__content\">\n    <div class=\"df-slider\" data-facet=\"{{name}}\">\n      <div class=\"df-slider__range\"></div>\n    </div>\n  </div>\n</div>";
      } else {
        template = options.template;
      }
      this.sliderSelector = ".df-slider[data-facet='" + this.name + "'] > .df-slider__range";
      this.sliderOptions = options.sliderOptions;
      this.sliderRendered = false;
      RangeFacet.__super__.constructor.call(this, container, template, options);
    }

    RangeFacet.prototype.renderSlider = function(options) {
      var context, html;
      context = $.extend(true, {
        name: this.name
      }, this.extraContext || {});
      html = this.mustache.render(this.template, context);
      $(this.container).html(html);
      return this.sliderRendered = true;
    };

    RangeFacet.prototype.render = function(res) {
      var _this, options, range, slider, start;
      if (!res.facets || !res.facets[this.name]) {
        throw Error("Error in RangeFacet: " + this.name + " facet is not configured.");
      } else if (!res.facets[this.name].range) {
        throw Error("Error in RangeFacet: " + this.name + " facet is not a range facet.");
      }
      _this = this;
      if (res.total > 0) {
        range = [parseFloat(res.facets[this.name].range.buckets[0].stats.min, 10), parseFloat(res.facets[this.name].range.buckets[0].stats.max, 10)];
        options = {
          start: range,
          range: {
            min: range[0],
            max: range[1]
          },
          connect: true,
          tooltips: true,
          pips: {
            mode: 'range'
          }
        };
        options = $.extend(true, options, this.sliderOptions || {});
        if (res && res.filter && res.filter.range && res.filter.range[this.name]) {
          start = [parseFloat(res.filter.range[this.name].gte, 10), parseFloat(res.filter.range[this.name].lte, 10)];
          if (!isNaN(start[0])) {
            options.start[0] = start[0];
          }
          if (!isNaN(start[1])) {
            options.start[1] = start[1];
          }
        }
        console.log(options);
        if (this.sliderRendered !== true) {
          this.renderSlider(options);
          slider = $(this.sliderSelector).get(0);
          noUiSlider.create(slider, options);
          slider.noUiSlider.on('change', function() {
            var max, min, ref;
            ref = slider.noUiSlider.get(), min = ref[0], max = ref[1];
            _this.controller.addFilter(_this.name, {
              'gte': parseFloat(min, 10),
              'lte': parseFloat(max, 10)
            });
            return _this.controller.refresh();
          });
        } else {
          $(this.sliderSelector).get(0).noUiSlider.updateOptions(options);
        }
      }
      return this.trigger('df:rendered', [res]);
    };

    RangeFacet.prototype.renderNext = function() {};

    return RangeFacet;

  })(Display);

  module.exports = RangeFacet;

}).call(this);
