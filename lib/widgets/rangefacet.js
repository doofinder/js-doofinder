(function() {
  var Display, RangeFacet, helpers, merge, noUiSlider,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  noUiSlider = require("nouislider");

  Display = require("./display");

  helpers = require("../util/helpers");

  merge = require("../util/merge");


  /**
   * Represents a range slider control to filter numbers within a range.
   */

  RangeFacet = (function(superClass) {
    extend(RangeFacet, superClass);

    RangeFacet.defaultTemplate = "<div class=\"df-slider\" data-facet=\"{{name}}\"></div>";

    RangeFacet.formatFn = {
      to: function(value) {
        var formattedValue;
        if (value != null) {
          value = parseFloat(value, 10);
          formattedValue = helpers.fn.decodeEntities(this.format(value));
          this.values[formattedValue] = value;
          return formattedValue;
        } else {
          return "";
        }
      },
      from: function(formattedValue) {
        return this.values[formattedValue] || formattedValue;
      }
    };

    RangeFacet.basicFormat = function(value) {
      return (("" + (value.toFixed(2))).replace(/0+$/, "")).replace(/\.{1}$/, "");
    };


    /**
     * @param  {String|Node|DfDomElement} element Container node.
     * @param  {String} facet                     Name of the facet as defined
     *                                            in Doofinder.
     * @param  {Object} options                   Options object.
     * @public
     *
     * Options (apart from those inherited from Display):
     *
     * - pips: noUiSlider pips configuration or `false`. `undefined` by default.
     * - format: Function that receives a number and returns it formatted
     *           as string.
     */

    function RangeFacet(element, facet, options) {
      var defaults;
      this.facet = facet;
      if (options == null) {
        options = {};
      }
      defaults = {
        template: this.constructor.defaultTemplate,
        pips: void 0,
        format: void 0
      };
      RangeFacet.__super__.constructor.call(this, element, merge(defaults, options));
      this.format = this.options.format || this.constructor.basicFormat;
      this.slider = null;
      this.values = {};
      this.range = {};
      this.sliderOpts = {};
    }


    /**
     * Renders the slider for the very first time.
     * @protected
     * @param  {Object} options Slider options.
     */

    RangeFacet.prototype.__renderSlider = function(options) {
      this.element.html(this.__renderTemplate({
        name: this.facet
      }));
      this.slider = document.createElement('div');
      (this.element.find("[data-facet=\"" + this.facet + "\"]")).append(this.slider);
      noUiSlider.create(this.slider, options);
      this.slider.noUiSlider.on('change', this.__handleSliderChanged.bind(this));
      return void 0;
    };


    /**
     * Gets a proper range for the slider given a search response.
     * @protected
     * @param  {Object} res Search response.
     * @return {Object}     Object with `min`, `max`, `start` and `end` keys.
     */

    RangeFacet.prototype.__getRangeFromResponse = function(response) {
      var range, rangeFilter, ref, ref1, stats;
      stats = response.facets[this.facet].range.buckets[0].stats;
      range = {
        min: parseFloat(stats.min || 0, 10),
        max: parseFloat(stats.max || 0, 10)
      };
      if ((rangeFilter = response != null ? (ref = response.filter) != null ? (ref1 = ref.range) != null ? ref1[this.facet] : void 0 : void 0 : void 0) != null) {
        range.start = (parseFloat(rangeFilter.gte, 10)) || range.min;
        range.end = (parseFloat(rangeFilter.lte, 10)) || range.max;
      } else {
        range.start = range.min;
        range.end = range.max;
      }
      return range;
    };


    /**
     * Builds an options object for noUiSlider given a range object.
     *
     * @protected
     * @param  {Object} range Object as returned by `__getRangeFromResponse`.
     * @return {Object}       Options object.
     */

    RangeFacet.prototype.__getSliderOptions = function(range) {
      var sliderOpts;
      sliderOpts = {
        start: [range.start, range.end],
        pips: {
          mode: 'positions',
          values: [0, 50, 100],
          density: 6,
          format: {
            to: this.constructor.formatFn.to.bind(this),
            from: this.constructor.formatFn.from.bind(this)
          }
        },
        range: {
          min: range.min,
          max: range.max
        },
        connect: true,
        tooltips: true,
        format: {
          to: this.constructor.formatFn.to.bind(this),
          from: this.constructor.formatFn.from.bind(this)
        }
      };
      return merge({}, sliderOpts, {
        pips: this.options.pips
      });
    };


    /**
     * Updates the controller when the range changes.
     * @protected
     */

    RangeFacet.prototype.__handleSliderChanged = function() {
      var end, ref, start;
      ref = this.get(), start = ref[0], end = ref[1];
      if (start === this.range.min && end === this.range.max) {
        this.controller.removeFilter(this.facet);
      } else {
        this.controller.addFilter(this.facet, {
          gte: start,
          lte: end
        });
      }
      this.values = {};
      this.controller.refresh();
      return this.trigger("df:range:change", [
        {
          start: start,
          end: end
        }, {
          min: this.range.min,
          max: this.range.max
        }
      ]);
    };


    /**
     * Sets the range of the slider.
     * @param {Array} value 2-number array with min and max values to set.
     */

    RangeFacet.prototype.set = function(value) {
      this.slider.noUiSlider.set(value);
      return this.__handleSliderChanged();
    };


    /**
     * Returns the current value of the slider.
     * @return {Array} value 2-number array with start and end values set.
     */

    RangeFacet.prototype.get = function() {
      var end, ref, start;
      if (this.slider != null) {
        ref = this.slider.noUiSlider.get(), start = ref[0], end = ref[1];
        return [this.values[start], this.values[end]];
      } else {
        return [];
      }
    };


    /**
     * Called when the "first page" response for a specific search is received.
     * Renders the widget with the data received, by replacing its content.
     *
     * @param {Object} res Search response.
     * @fires RangeFacet#df:widget:render
     */

    RangeFacet.prototype.render = function(response) {
      if (response.page === 1) {
        this.range = this.__getRangeFromResponse(response);
        if (this.range.min === this.range.max) {
          return this.clean();
        } else {
          this.sliderOpts = this.__getSliderOptions(this.range);
          if (this.slider === null) {
            this.__renderSlider(this.sliderOpts);
          } else {
            this.slider.noUiSlider.updateOptions(this.sliderOpts);
          }
          return this.trigger("df:widget:render", [response]);
        }
      }
    };


    /**
     * Cleans the widget by removing all the HTML inside the container element.
     * Resets the `slider` property of the widget to remove any references to the
     * slider and allowing garbage collection.
     */

    RangeFacet.prototype.clean = function() {
      this.slider = null;
      this.values = {};
      return RangeFacet.__super__.clean.apply(this, arguments);
    };

    return RangeFacet;

  })(Display);

  module.exports = RangeFacet;

}).call(this);
