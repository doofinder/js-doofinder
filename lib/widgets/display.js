(function() {
  var Display, Widget, extend, helpers,
    extend1 = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  extend = require("extend");

  Widget = require("./widget");

  helpers = require("../util/helpers");


  /**
   * Widget that renders a search response within a given template.
   */

  Display = (function(superClass) {
    extend1(Display, superClass);

    Display.defaultTemplate = "{{#results}}\n  <a href=\"{{link}}\" class=\"df-card\">{{title}}</a>\n{{/results}}";


    /**
     * @param  {(String|Node|DfDomElement)} element  Container node.
     * @param  {Object}                     options  Options for the widget.
     */

    function Display(element, options) {
      var defaults;
      if (options == null) {
        options = {};
      }
      defaults = {
        template: this.constructor.defaultTemplate,
        templateFunctions: {},
        templateVars: {},
        translations: {}
      };
      options = extend(true, defaults, options);
      Display.__super__.constructor.call(this, element, options);
      helpers.addTranslateHelper(this.options.templateFunctions, this.options.translations);
      this.mustache = require("mustache");
      this.currentContext = {};
    }


    /**
     * Adds extra context to the passed context object.
     * @param  {Object} response = {} Search response as initial context.
     * @return {Object}               Extended search response.
     * @protected
     */

    Display.prototype.__buildContext = function(response) {
      if (response == null) {
        response = {};
      }
      return this.currentContext = extend(true, {}, response, this.options.templateVars, this.options.templateFunctions, {
        is_first: response.page === 1,
        is_last: response.page === Math.ceil(response.total / response.results_per_page)
      });
    };


    /**
     * Actually renders the template given a search response.
     * @param  {Object} res Search response.
     * @return {String}     The rendered HTML code.
     * @protected
     */

    Display.prototype.__renderTemplate = function(res) {
      return this.mustache.render(this.options.template, this.__buildContext(res));
    };


    /**
     * Called when the "first page" response for a specific search is received.
     * Renders the widget with the data received, by replacing its content.
     *
     * @param {Object} res Search response.
     * @fires Widget#df:widget:render
     */

    Display.prototype.render = function(res) {
      this.element.html(this.__renderTemplate(res));
      return Display.__super__.render.apply(this, arguments);
    };


    /**
     * Cleans the widget by removing all the HTML inside the container element.
     * @fires Widget#df:widget:clean
     */

    Display.prototype.clean = function() {
      this.element.html("");
      return Display.__super__.clean.apply(this, arguments);
    };

    return Display;

  })(Widget);

  module.exports = Display;

}).call(this);
