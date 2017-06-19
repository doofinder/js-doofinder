(function() {
  var $, BaseFacet, TermFacet, extend,
    extend1 = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  BaseFacet = require("./basefacet");

  extend = require("extend");

  $ = require("../../util/dfdom");


  /**
   * Represents a terms selector control to filter by the possible values of a
   * text field.
   */

  TermFacet = (function(superClass) {
    extend1(TermFacet, superClass);

    TermFacet.defaultLabelTemplate = "{{label}}{{#total_selected}} ({{total_selected}}){{/total_selected}}";

    TermFacet.defaultTemplate = "{{#terms}}\n  <a class=\"df-term\" href=\"#\" data-facet=\"{{name}}\" data-value=\"{{key}}\"\n      {{#extra-content}}{{index}}:{{size}}{{/extra-content}}\n      {{#selected}}data-selected{{/selected}}>\n    {{key}} <span class=\"df-term__count\">{{doc_count}}</span>\n  </a>\n{{/terms}}\n{{#show-more-button}}{{terms.length}}:{{size}}{{/show-more-button}}";

    TermFacet.defaultButtonTemplate = "<button type=\"button\" data-toggle-extra-content\n    data-text-normal=\"{{#translate}}{{viewMoreLabel}}{{/translate}}\"\n    data-text-toggle=\"{{#translate}}{{viewLessLabel}}{{/translate}}\">\n  {{#translate}}{{viewMoreLabel}}{{/translate}}\n</button>";


    /**
     * @param  {String|Node|DfDomElement} element  Container node.
     * @param  {String} name    Name of the facet/filter.
     * @param  {Object} options Options object. Empty by default.
     */

    function TermFacet(element, name, options) {
      var defaults;
      if (options == null) {
        options = {};
      }
      defaults = {
        size: null,
        buttonTemplate: this.constructor.defaultButtonTemplate,
        templateVars: {
          viewMoreLabel: "View more...",
          viewLessLabel: "View less..."
        },
        templateFunctions: {
          "extra-content": (function(_this) {
            return function() {

              /**
               * Returns `data-extra-content` if the (0-based) index is greater
               * than or equal to the size passed.
               *
               * Index and size are passed as text and must be parsed:
               *
               * {{#extra-content}}{{index}}:{{size}}{{/extra-content}}
               *
               * @param  {string}   text
               * @param  {Function} render
               * @return {string}   "data-extra-content" or ""
               */
              return function(text, render) {
                var index, ref, size;
                ref = (render(text)).split(":"), index = ref[0], size = ref[1];
                if ((parseInt(index.trim(), 10)) >= (parseInt(size.trim(), 10))) {
                  return "data-extra-content";
                } else {
                  return "";
                }
              };
            };
          })(this),
          "show-more-button": (function(_this) {
            return function() {

              /**
               * Renders a `View More` button if the length is greater than the
               * size passed.
               *
               * {{#show-more-button}}{{length}}:{{size}}{{/show-more-button}}
               *
               * @param  {string}   text
               * @param  {Function} render
               * @return {string}   Rendered button or "".
               */
              return function(text, render) {
                var length, ref, size;
                ref = (render(text)).split(":"), length = ref[0], size = ref[1];
                if ((parseInt(length.trim(), 10)) > (parseInt(size.trim(), 10))) {
                  return _this.mustache.render(_this.options.buttonTemplate, _this.buildContext());
                } else {
                  return "";
                }
              };
            };
          })(this)
        }
      };
      options = extend(true, defaults, options);
      TermFacet.__super__.constructor.apply(this, arguments);
    }


    /**
     * Initializes the object with a controller and attachs event handlers for
     * this widget instance.
     *
     * @param  {Controller} controller Doofinder Search controller.
     */

    TermFacet.prototype.init = function(controller) {
      TermFacet.__super__.init.apply(this, arguments);
      this.element.on("click", "[data-facet='" + this.name + "'][data-value]", (function(_this) {
        return function(e) {
          var eventInfo, key, termNode, value, wasSelected;
          e.preventDefault();
          termNode = $(e.target);
          value = termNode.data("value");
          key = termNode.data("facet");
          wasSelected = termNode.hasAttr("data-selected");
          if (!wasSelected) {
            termNode.attr("data-selected", "");
            _this.controller.addFilter(key, value);
          } else {
            termNode.removeAttr("data-selected");
            _this.controller.removeFilter(key, value);
          }
          _this.controller.refresh();
          eventInfo = {
            facetName: key,
            facetValue: value,
            selected: !wasSelected,
            totalSelected: _this.getSelectedElements().length
          };
          return _this.trigger("df:term_clicked", [eventInfo]);
        };
      })(this));
      if (this.options.size !== null) {
        this.element.on("click", "[data-toggle-extra-content]", (function(_this) {
          return function(e) {
            var btn, currentText, viewLessText, viewMoreText;
            e.preventDefault();
            btn = _this.getShowMoreButton();
            currentText = btn.textContent.trim();
            viewMoreText = (btn.getAttribute("data-text-normal")).trim();
            viewLessText = (btn.getAttribute("data-text-toggle")).trim();
            if (currentText === viewMoreText) {
              btn.textContent = viewLessText;
              return _this.element.attr("data-view-extra-content", "");
            } else {
              btn.textContent = viewMoreText;
              return _this.element.removeAttr("data-view-extra-content");
            }
          };
        })(this));
        this.bind("df:rendered", (function(_this) {
          return function(res) {
            var btn;
            if ((_this.element.attr("data-view-extra-content")) != null) {
              btn = _this.getShowMoreButton();
              return btn != null ? btn.textContent = (btn.getAttribute("data-text-toggle")).trim() : void 0;
            }
          };
        })(this));
        return this.bind("df:cleaned", (function(_this) {
          return function(res) {
            var btn;
            _this.element.removeAttr("data-view-extra-content");
            btn = _this.getShowMoreButton();
            return btn != null ? btn.textContent = (btn.getAttribute("data-text-normal")).trim() : void 0;
          };
        })(this));
      }
    };


    /**
     * @return {HTMLElement} The "show more" button.
     */

    TermFacet.prototype.getShowMoreButton = function() {
      return (this.element.find("[data-toggle-extra-content]")).element[0];
    };


    /**
     * @return {DfDomElement} Collection of selected term nodes.
     */

    TermFacet.prototype.getSelectedElements = function() {
      return this.element.find("[data-facet][data-selected]");
    };


    /**
     * @return {Number} Number of selected term nodes.
     */

    TermFacet.prototype.countSelectedElements = function() {
      return this.getSelectedElements().length;
    };


    /**
     * @param  {Object} res Results response from the server.
     * @return {Number}     Total terms used for filter.
     */

    TermFacet.prototype.countSelectedTerms = function(res) {
      var ref, ref1;
      return (((ref = res.filter) != null ? (ref1 = ref.terms) != null ? ref1[this.name] : void 0 : void 0) || []).length;
    };


    /**
     * Renders the label of the facet widget based on the given search response,
     * within the configured label template. The number of selected terms is
     * passed to the context so it can be used in the template.
     *
     * @param  {Object} res Search response.
     * @return {String}     The rendered label.
     */

    TermFacet.prototype.renderLabel = function(res) {
      return TermFacet.__super__.renderLabel.call(this, extend(true, res, {
        total_selected: this.countSelectedTerms(res)
      }));
    };


    /**
     * Called when the "first page" response for a specific search is received.
     * Renders the widget with the data received, by replacing its content.
     *
     * @param {Object} res Search response.
     * @fires TermFacet#df:rendered
     */

    TermFacet.prototype.render = function(res) {
      var context, eventInfo, i, index, len, ref, ref1, ref2, ref3, selectedTerms, term, totalSelected;
      if (!res.facets || !res.facets[this.name]) {
        this.raiseError("TermFacet: " + this.name + " facet is not configured");
      } else if (!res.facets[this.name].terms.buckets) {
        this.raiseError("TermFacet: " + this.name + " facet is not a terms facet");
      }
      if (res.facets[this.name].terms.buckets.length > 0) {
        selectedTerms = {};
        ref2 = ((ref = res.filter) != null ? (ref1 = ref.terms) != null ? ref1[this.name] : void 0 : void 0) || [];
        for (i = 0, len = ref2.length; i < len; i++) {
          term = ref2[i];
          selectedTerms[term] = true;
        }
        selectedTerms;
        ref3 = res.facets[this.name].terms.buckets;
        for (index in ref3) {
          term = ref3[index];
          term.index = index;
          term.name = this.name;
          if (selectedTerms[term.key]) {
            term.selected = 1;
          } else {
            term.selected = 0;
          }
        }
        totalSelected = this.countSelectedTerms(res);
        context = extend(true, {
          any_selected: totalSelected > 0,
          total_selected: totalSelected,
          name: this.name,
          terms: res.facets[this.name].terms.buckets
        });
        eventInfo = {
          facetName: this.name,
          totalSelected: totalSelected
        };
        this.element.html(this.mustache.render(this.template, this.buildContext(context)));
        return this.trigger("df:rendered", [res, eventInfo]);
      } else {
        return this.clean();
      }
    };

    return TermFacet;

  })(BaseFacet);

  module.exports = TermFacet;

}).call(this);
