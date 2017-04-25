(function() {
  var Display, Widget, addHelpers, extend,
    extend1 = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Widget = require("../widget");

  addHelpers = (require("../util/helpers")).addHelpers;

  extend = require("extend");


  /**
   * Widget that renders a search response within a given template.
   */

  Display = (function(superClass) {
    extend1(Display, superClass);


    /**
     * @param  {String|Node|DfDomElement} element  Container node.
     * @param  {String}                   template Template to paint the response.
     * @param  {Objects}                  options  Options for the widget.
     */

    function Display(element, template, options) {
      this.template = template;
      if (options == null) {
        options = {};
      }
      this.mustache = require("mustache");
      this.extraContext = options.templateVars || {};
      Display.__super__.constructor.call(this, element, options);
    }


    /**
     * Adds more context to the search response.
     *
     * Adds:
     *
     * - extraContent (templateVars passed in the options or added later)
     * - Extra parameters to add to the results links.
     * - Currency options.
     * - Translations.
     * - Template Functions.
     * - is_first: Indicates if this is a "first page" response.
     * - is_last: Indicates if there's no next page for this search.
     *
     * @param  {Object} res Search response.
     * @return {Object} Extended response.
     */

    Display.prototype.addHelpers = function(res) {
      var context, ref, ref1;
      if (res == null) {
        res = {};
      }
      context = addHelpers(extend(true, res, this.extraContext), this.options.urlParams, this.options.currency, this.options.translations, this.options.templateFunctions);
      return extend(true, context, {
        is_first: res.page === 1,
        is_last: (ref = this.controller) != null ? (ref1 = ref.status) != null ? ref1.lastPageReached : void 0 : void 0
      });
    };


    /**
     * Called when the "first page" response for a specific search is received.
     * Renders the widget with the data received, by replacing its content.
     *
     * @param {Object} res Search response.
     * @fires Display#df:rendered
     */

    Display.prototype.render = function(res) {
      this.element.html(this.mustache.render(this.template, this.addHelpers(res)));
      return this.trigger("df:rendered", [res]);
    };


    /**
     * Called when subsequent (not "first-page") responses for a specific search
     * are received. Renders the widget with the data received, by replacing its
     * content.
     *
     * @param {Object} res Search response.
     * @fires Display#df:rendered
     */

    Display.prototype.renderNext = function(res) {
      this.element.html(this.mustache.render(this.template, this.addHelpers(res)));
      return this.trigger("df:rendered", [res]);
    };


    /**
     * Cleans the widget by removing all the HTML inside the container element.
     * @fires Display#df:cleaned
     */

    Display.prototype.clean = function() {
      this.element.html("");
      return this.trigger("df:cleaned");
    };


    /**
     * Adds extra context to be used when rendering a search response.
     * @param {String} key   Name of the variable to be used in the template.
     * @param {*}      value Value of the variable.
     */

    Display.prototype.addExtraContext = function(key, value) {
      if (this.extraContext === void 0) {
        this.extraContext = {};
      }
      return this.extraContext[key] = value;
    };

    return Display;

  })(Widget);

  module.exports = Display;

}).call(this);
