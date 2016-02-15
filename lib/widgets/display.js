
/*
display.coffee
author: @ecoslado
2015 11 10
 */


/*
Display
This class receives the search
results and paint them in a container
shaped by template. Every new page
replaces the current content.
 */

(function() {
  var $, Display, Widget, addHelpers,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Widget = require('../widget');

  addHelpers = require("../util/helpers").addHelpers;

  $ = require("../util/jquery");

  Display = (function(superClass) {
    extend(Display, superClass);


    /*
    constructor
    
    @param {String} container
    @param {String|Function} template
    @param {Object} options 
    @api public
     */

    function Display(container, template, options) {
      this.template = template;
      if (options == null) {
        options = {};
      }
      this.container = container;
      this.mustache = require("mustache");
      this.extraContext = options.templateVars;
      this.addHelpers = function(context) {
        return addHelpers(context, options.urlParams, options.currency, options.translations, options.templateFunctions);
      };
      Display.__super__.constructor.call(this, container);
    }


    /*
    render
    
    Replaces the older results in container with
    the given
    
    @param {Object} res
    @api public
     */

    Display.prototype.render = function(res) {
      var context, html;
      context = $.extend(true, res, this.extraContext || {});
      this.addHelpers(context);
      html = this.mustache.render(this.template, context);
      try {
        $(this.container).html(html);
        return this.trigger("df:rendered", [res]);
      } catch (_error) {
        throw Error("widget.Display: Error while rendering." + " The container you are trying to access does not already exist.");
      }
    };


    /*
    renderNext
    
    Replaces results to the older in container
    @param {Object} res
    @api public
     */

    Display.prototype.renderNext = function(res) {
      this.render(res);
      return this.trigger("df:rendered", [res]);
    };


    /*
    clean
    
    Cleans the container content.
    @api public
     */

    Display.prototype.clean = function() {
      return $(this.container).html("");
    };


    /*
    addExtraContext
    
    Allows adding context dynamically.
    @param {String} key
    @param {Mixed} value
    @api public
     */

    Display.prototype.addExtraContext = function(key, value) {
      if (this.extraContext === void 0) {
        this.extraContext = {};
      }
      return this.extraContext[key] = value;
    };

    module.exports = Display;

    return Display;

  })(Widget);

}).call(this);
