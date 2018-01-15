(function() {
  var Display, RangeFacet, defaultTemplate, extend, noUiSlider,
    extend1 = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  extend = require("extend");

  noUiSlider = require("nouislider");

  Display = require("../display");

  defaultTemplate = "<div class=\"{{sliderClassName}}\" data-facet=\"{{name}}\"></div>";


  /**
   * Represents a range slider control to filter numbers within a range.
   */

  RangeFacet = (function(superClass) {
    extend1(RangeFacet, superClass);


    /**
     * Apart from inherited options, this widget accepts these options:
     *
     * - sliderClassName (String) The CSS class of the node that actually holds
     *                            the slider.
     *
     * IMPORTANT: Pips support is buggy so, if no sliderOptions.pips is found, the
     * widget paints them itself. If the sliderOptions.pips is false, no pips are
     * displayed. In any other case, noUiSlider is in charge of displaying them.
     *
     * @param  {String|Node|DfDomElement} element  Container node.
     * @param  {String} facet    Name of the facet/filter.
     * @param  {Object} options Options object. Empty by default.
     */

    function RangeFacet(element, facet, options) {
      this.facet = facet;
      if (options == null) {
        options = {};
      }
      options = extend(true, {
        template: defaultTemplate
      }, options);
      RangeFacet.__super__.constructor.call(this, element, options);
      this.sliderClassName = options.sliderClassName || 'df-slider';
      this.sliderSelector = "." + this.sliderClassName + "[data-facet=\"" + this.facet + "\"]";
      if (this.options.format) {
        this.format = this.options.format;
      } else {
        this.format = function(value) {
          return (value != null) && (value.toFixed(2) + '').replace(/0+$/, '').replace(/\.{1}$/, '');
        };
      }
      this.slider = null;
      this.values = {};
      this.range = {};
    }


    /**
     * Renders the slider for the very first time.
     * @protected
     * @param  {Object} options Slider options.
     */

    RangeFacet.prototype.__renderSlider = function(options) {
      var context;
      context = {
        name: this.facet,
        sliderClassName: this.sliderClassName
      };
      this.element.html(this.__renderTemplate(context));
      this.slider = document.createElement('div');
      this.element.find(this.sliderSelector).append(this.slider);
      noUiSlider.create(this.slider, options);
      this.slider.noUiSlider.on('change', this.__sliderChanged.bind(this));
      return void 0;
    };


    /*
    Renders the slider pips
    
    @param {Object} Values for 0%, 50% and 100% pips ({0: 1, 50: 2, 100: 3})
    @api private
     */


    /**
     * Renders the slider's pips.
     * @param  {Object} values Values for 0%, 50% and 100% pips:
     *
     *                         {
     *                           0: 1,
     *                           50: 2,
     *                           100: 3
     *                         }
     */

    RangeFacet.prototype.__renderPips = function(values) {
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
            value.innerHTML = values != null ? values["" + pos] : '';
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


    /**
     * Gets a proper range for the slider given a search response.
     * @protected
     * @param  {Object} res Search response.
     * @return {Object}     Object with `min` and `max` properties.
     */

    RangeFacet.prototype.__getRangeFromResponse = function(res) {
      var range, stats;
      stats = res.facets[this.facet].range.buckets[0].stats;
      return range = {
        min: parseFloat(stats.min || 0, 10),
        max: parseFloat(stats.max || 0, 10)
      };
    };

    RangeFacet.prototype.__sliderChanged = function() {
      var max, min, ref;
      ref = this.slider.noUiSlider.get(), min = ref[0], max = ref[1];
      if (this.values[min] === this.range.min && this.values[max] === this.range.max) {
        this.controller.removeFilter(this.facet);
      } else {
        this.controller.addFilter(this.facet, {
          gte: this.values[min],
          lte: this.values[max]
        });
      }
      this.controller.refresh();
      this.trigger("df:range:change", [
        {
          gte: this.values[min],
          lte: this.values[max]
        }, {
          min: this.range.min,
          max: this.range.max
        }
      ]);
      return this.values = {};
    };

    RangeFacet.prototype.set = function(value) {
      this.slider.noUiSlider.set(value);
      return this.__sliderChanged();
    };


    /**
     * Called when the "first page" response for a specific search is received.
     * Renders the widget with the data received, by replacing its content.
     *
     * @param {Object} res Search response.
     * @fires RangeFacet#df:widget:render
     */

    RangeFacet.prototype.render = function(res) {
      var options, ref, ref1, start, values;
      if (res.page === 1) {
        this.range = this.__getRangeFromResponse(res);
        if (this.range.min === this.range.max) {
          return this.clean();
        } else {
          options = {
            start: [this.range.min, this.range.max],
            range: this.range,
            connect: true,
            tooltips: true,
            format: {
              to: (function(_this) {
                return function(value) {
                  var formattedValue;
                  if (value != null) {
                    formattedValue = _this.format(value);
                    _this.values[formattedValue] = parseFloat(value, 10);
                    return formattedValue;
                  } else {
                    return "";
                  }
                };
              })(this),
              from: (function(_this) {
                return function(formattedValue) {
                  return formattedValue;
                };
              })(this)
            }
          };
          if (res != null ? (ref = res.filter) != null ? (ref1 = ref.range) != null ? ref1[this.facet] : void 0 : void 0 : void 0) {
            start = [parseFloat(res.filter.range[this.facet].gte, 10), parseFloat(res.filter.range[this.facet].lte, 10)];
            if (!isNaN(start[0])) {
              options.start[0] = start[0];
            }
            if (!isNaN(start[1])) {
              options.start[1] = start[1];
            }
          }
          if (this.slider === null) {
            this.__renderSlider(options);
          } else {
            this.slider.noUiSlider.updateOptions(options);
          }
          if (options.pips == null) {
            values = {
              0: options.format.to(options.range.min),
              50: options.format.to((options.range.min + options.range.max) / 2.0),
              100: options.format.to(options.range.max)
            };
            this.__renderPips(values);
          }
          this.trigger("df:widget:render", [res]);
          return this.trigger("df:rendered", [res]);
        }
      } else {
        return false;
      }
    };


    /**
     * Cleans the widget by removing all the HTML inside the container element.
     * Resets the `slider` property of the widget to remove any references to the
     * slider and allowing garbage collection.
     */

    RangeFacet.prototype.clean = function() {
      this.slider = null;
      return RangeFacet.__super__.clean.apply(this, arguments);
    };

    return RangeFacet;

  })(Display);

  module.exports = RangeFacet;

}).call(this);
