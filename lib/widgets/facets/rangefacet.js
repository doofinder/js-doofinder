
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
      this.slider = null;
      RangeFacet.__super__.constructor.call(this, container, template, options);
    }

    RangeFacet.prototype.renderSlider = function(options) {
      var _this, container, context;
      _this = this;
      context = $.extend(true, {
        name: this.name
      }, this.extraContext || {});
      container = document.querySelector(this.container);
      container.innerHTML = this.mustache.render(this.template, context);
      this.slider = $(this.sliderSelector).get(0);
      noUiSlider.create(this.slider, options);
      this.renderPips(options);
      return this.slider.noUiSlider.on('change', function() {
        var max, min, ref;
        ref = _this.slider.noUiSlider.get(), min = ref[0], max = ref[1];
        _this.controller.addFilter(_this.name, {
          'gte': parseFloat(min, 10),
          'lte': parseFloat(max, 10)
        });
        return _this.controller.refresh();
      });
    };

    RangeFacet.prototype.updateSlider = function(options) {
      this.slider.noUiSlider.updateOptions(options);
      return this.renderPips(options);
    };

    RangeFacet.prototype.renderPips = function(options) {
      var i, j, len, markerType, node, pip, pips, pos, ref, ref1, value, values;
      if (options.pips === void 0) {
        pips = this.slider.querySelector('div.noUi-pips.noUi-pips-horizontal');
        values = {
          0: options.format.to(options.range.min),
          50: options.format.to((options.range.min + options.range.max) / 2.0),
          100: options.format.to(options.range.max)
        };
        if (pips === null) {
          pips = document.createElement('div');
          pips.setAttribute('class', 'noUi-pips noUi-pips-horizontal');
          for (pos = i = 0, ref = 100 / 16; i <= 100; pos = i += ref) {
            markerType = pos === 0 || pos === 50 || pos === 100 ? 'large' : 'normal';
            pip = document.createElement('div');
            pip.setAttribute('class', "noUi-marker noUi-marker-horizontal noUi-marker-" + markerType);
            pip.setAttribute('style', "left: " + pos + "%;");
            pips.appendChild(pip);
            if (pos === 0 || pos === 50 || pos === 100) {
              value = document.createElement('div');
              value.setAttribute('class', 'noUi-value noUi-value-horizontal noUi-value-large');
              value.setAttribute('data-position', pos);
              value.setAttribute('style', "left: " + pos + "%;");
              value.innerText = values[pos + ''];
              pips.appendChild(value);
            }
          }
        } else {
          ref1 = pips.querySelectorAll('div[data-position]');
          for (j = 0, len = ref1.length; j < len; j++) {
            node = ref1[j];
            node.innerText = values[node.getAttribute('data-position')];
          }
        }
      }
      return this.slider.appendChild(pips);
    };

    RangeFacet.prototype.render = function(res) {
      var _this, disabled, options, range, start;
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
          format: {
            to: function(value) {
              return value !== void 0 && (value.toFixed(2) + '').replace(/0+$/, '').replace(/\.{1}$/, '');
            },
            from: Number
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
        disabled = options.range.min === options.range.max;
        if (disabled) {
          options.range.min -= 1;
          options.range.max += 1;
          options.step = 1;
        }
        if (this.slider === null) {
          this.renderSlider(options);
        } else {
          this.updateSlider(options);
        }
        if (disabled) {
          this.slider.setAttribute('disabled', true);
        } else {
          this.slider.removeAttribute('disabled');
        }
      }
      return this.trigger('df:rendered', [res]);
    };

    RangeFacet.prototype.renderNext = function() {};

    return RangeFacet;

  })(Display);

  module.exports = RangeFacet;

}).call(this);
