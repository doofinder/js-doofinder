
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
  var Display, RangeFacet, extend, noUiSlider,
    extend1 = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Display = require("../display");

  noUiSlider = require("nouislider");

  extend = require("extend");

  RangeFacet = (function(superClass) {
    extend1(RangeFacet, superClass);


    /*
    Initializes the widget
    
    @param {String} container
    @param {String|Function} template
    @param {Object} options
    
    Apart from those inherited, this widget accepts these options:
    
    - sliderClassName {String} The CSS class of the node that holds the slider.
    
    IMPORTANT: Pips support is buggy so, if no sliderOptions.pips is found, the
    widget paints them itself. If the sliderOptions.pips is false, no pips are
    displayed. In any other case, noUiSlider is in charge of displaying them.
    
    @api public
     */

    function RangeFacet(element, name, options) {
      var template;
      this.name = name;
      if (options == null) {
        options = {};
      }
      this.sliderClassName = options.sliderClassName || 'df-slider';
      this.sliderSelector = "." + this.sliderClassName + "[data-facet='" + this.name + "']";
      if (!options.template) {
        template = "<div class=\"df-panel\" data-facet=\"{{name}}\">\n  <a href=\"#\" class=\"df-panel__title\" data-toggle=\"panel\">{{label}}</a>\n  <div class=\"df-panel__content\">\n    <div class=\"{{sliderClassName}}\" data-facet=\"{{name}}\"></div>\n  </div>\n</div>";
      } else {
        template = options.template;
      }
      if (options.format) {
        this.format = options.format;
      } else {
        this.format = function(value) {
          return (value != null) && (value.toFixed(2) + '').replace(/0+$/, '').replace(/\.{1}$/, '');
        };
      }
      this.slider = null;
      this.values = {};
      this.parseNumber = parseFloat;
      RangeFacet.__super__.constructor.call(this, element, template, options);
    }


    /*
    Renders the slider for the very first time.
    
    @param {Object} Slider options
    @api private
     */

    RangeFacet.prototype._renderSlider = function(options) {
      var context, self;
      self = this;
      context = {
        name: this.name,
        sliderClassName: this.sliderClassName
      };
      context = extend(true, context, this.extraContext || {});
      this.element.html(this.mustache.render(this.template, context));
      this.slider = document.createElement('div');
      this.element.find(this.sliderSelector).append(this.slider);
      noUiSlider.create(this.slider, options);
      this.slider.noUiSlider.on('change', function() {
        var max, min, ref;
        ref = self.slider.noUiSlider.get(), min = ref[0], max = ref[1];
        self.controller.addFilter(self.name, {
          gte: self.values[min],
          lte: self.values[max]
        });
        self.controller.refresh();
        return self.values = {};
      });
      return this.numberType;
    };


    /*
    Renders the slider pips
    
    @param {Object} Values for 0%, 50% and 100% pips ({0: 1, 50: 2, 100: 3})
    @api private
     */

    RangeFacet.prototype._renderPips = function(values) {
      var i, j, len, markerType, node, pip, pips, pos, ref, ref1, results, results1, value;
      pips = this.slider.querySelector('div.noUi-pips.noUi-pips-horizontal');
      if (pips === null) {
        pips = document.createElement('div');
        pips.setAttribute('class', 'noUi-pips noUi-pips-horizontal');
        this.slider.appendChild(pips);
        results = [];
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
            value.innerHTML = values != null ? values[pos + ''] : '';
            results.push(pips.appendChild(value));
          } else {
            results.push(void 0);
          }
        }
        return results;
      } else {
        ref1 = pips.querySelectorAll('div[data-position]');
        results1 = [];
        for (j = 0, len = ref1.length; j < len; j++) {
          node = ref1[j];
          results1.push(node.innerHTML = values != null ? values[node.getAttribute('data-position')] : '');
        }
        return results1;
      }
    };


    /*
    Paints the slider based on the received response.
    
    @param {Object} Response
    @api public
     */

    RangeFacet.prototype.render = function(res) {
      var disabled, isInteger, options, overrides, range, self, start, stats, values;
      if (!res.facets || !res.facets[this.name]) {
        this.raiseError("RangeFacet: " + this.name + " facet is not configured");
      } else if (!res.facets[this.name].range) {
        this.raiseError("RangeFacet: " + this.name + " facet is not a range facet");
      }
      self = this;
      isInteger = function(candidate) {
        return Number(candidate || 0) && (candidate || 0) % 1 === 0;
      };
      if (res.total > 0 && (res.facets[this.name].range.buckets[0].stats.max == null) || res.facets[this.name].range.buckets[0].stats.max === res.facets[this.name].range.buckets[0].stats.min) {
        this.slider = null;
        this.element.empty();
      } else if (res.total > 0) {
        stats = res.facets[this.name].range.buckets[0].stats;
        this.parseNumber = isInteger(stats.min) && isInteger(stats.max) ? parseInt : parseFloat;
        range = [this.parseNumber(stats.min || 0, 10), this.parseNumber(stats.max || 0, 10)];
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
              var formattedValue;
              if (value != null) {
                formattedValue = self.format(value);
                self.values[formattedValue] = self.parseNumber(value);
                return formattedValue;
              } else {
                return "";
              }
            },
            from: function(formattedValue) {
              return formattedValue;
            }
          }
        };
        if (res && res.filter && res.filter.range && res.filter.range[this.name]) {
          start = [this.parseNumber(res.filter.range[this.name].gte, 10), this.parseNumber(res.filter.range[this.name].lte, 10)];
          if (!isNaN(start[0])) {
            options.start[0] = start[0];
          }
          if (!isNaN(start[1])) {
            options.start[1] = start[1];
          }
        }
        disabled = options.range.min === options.range.max;
        if (disabled) {
          overrides = {
            range: {
              min: options.range.min,
              max: options.range.max + 1
            }
          };
        }
        if (this.slider === null) {
          this._renderSlider(extend(true, {}, options, overrides || {}));
        } else {
          this.slider.noUiSlider.updateOptions(extend(true, {}, options, overrides || {}));
        }
        if (disabled) {
          this.slider.setAttribute('disabled', true);
        } else {
          this.slider.removeAttribute('disabled');
        }
        if (options.pips == null) {
          if (!disabled && this.parseNumber === parseInt) {
            values = {
              0: this.parseNumber(options.format.to(options.range.min)),
              50: this.parseNumber(options.format.to((options.range.min + options.range.max) / 2.0)),
              100: this.parseNumber(options.format.to(options.range.max))
            };
            this._renderPips(values);
          } else if (!disabled) {
            values = {
              0: options.format.to(options.range.min),
              50: options.format.to((options.range.min + options.range.max) / 2.0),
              100: options.format.to(options.range.max)
            };
            this._renderPips(values);
          } else {
            this._renderPips();
          }
        }
      }
      return this.trigger('df:rendered', [res]);
    };

    RangeFacet.prototype.renderNext = function() {};

    RangeFacet.prototype.clean = function() {
      RangeFacet.__super__.clean.call(this);
      return this.slider = null;
    };

    return RangeFacet;

  })(Display);

  module.exports = RangeFacet;

}).call(this);
