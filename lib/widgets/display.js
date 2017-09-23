(function() {
  var Display, Widget, addHelpers, defaultTemplate, extend,
    extend1 = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  extend = require("extend");

  Widget = require("./widget");

  addHelpers = require("../util/helpers");

  defaultTemplate = "{{#results}}\n  <a href=\"{{link}}\" class=\"df-card\">{{title}}</a>\n{{/results}}";


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

    function Display(element, options) {
      var defaults;
      if (options == null) {
        options = {};
      }
      defaults = {
        currency: void 0,
        queryParam: void 0,
        template: defaultTemplate,
        templateVars: {},
        templateFunctions: {},
        translations: void 0,
        urlParams: {}
      };
      options = extend(true, defaults, options);
      Display.__super__.constructor.call(this, element, options);
      this.mustache = require("mustache");
      this.currentContext = {};
    }


    /**
     * Adds extra context to the passed context object.
     * @param  {Object} context = {}  Initial context (i.e: a search response).
     * @return {Object}               Extended context.
     */

    Display.prototype.buildContext = function(res) {
      var context, defaults, overrides;
      if (res == null) {
        res = {};
      }
      defaults = {
        query: ""
      };
      overrides = {
        is_first: res.page === 1,
        is_last: res.page === Math.ceil(res.total / res.results_per_page),
        currency: this.options.currency,
        translations: this.options.translations,
        urlParams: this.options.urlParams
      };
      context = extend(true, {}, defaults, res, this.options.templateVars, this.options.templateFunctions, overrides);
      if (this.options.queryParam != null) {
        context.urlParams[this.options.queryParam] = context.query;
      }
      return this.currentContext = addHelpers(context);
    };

    Display.prototype.renderTemplate = function(res) {
      return this.mustache.render(this.options.template, this.buildContext(res));
    };


    /**
     * Called when the "first page" response for a specific search is received.
     * Renders the widget with the data received, by replacing its content.
     *
     * @param {Object} res Search response.
     * @fires Display#df:widget:render
     */

    Display.prototype.render = function(res) {
      this.element.html(this.renderTemplate(res));
      return Display.__super__.render.apply(this, arguments);
    };


    /**
     * Cleans the widget by removing all the HTML inside the container element.
     * @fires Display#df:widget:clean
     */

    Display.prototype.clean = function() {
      this.element.html("");
      return Display.__super__.clean.apply(this, arguments);
    };

    return Display;

  })(Widget);

  module.exports = Display;

}).call(this);
