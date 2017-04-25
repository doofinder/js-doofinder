
/*
Display
This class receives the search
results and paint them in an element
shaped by template. Every new page
replaces the current content.
 */

(function() {
  var Display, Widget, addHelpers, extend,
    extend1 = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Widget = require('../widget');

  addHelpers = require("../util/helpers").addHelpers;

  extend = require('extend');

  Display = (function(superClass) {
    extend1(Display, superClass);


    /*
    constructor
    
    @param {String} element
    @param {String|Function} template
    @param {Object} options
    @api public
     */

    function Display(element, template, options) {
      this.template = template;
      if (options == null) {
        options = {};
      }
      this.mustache = require("mustache");
      this.extraContext = options.templateVars;
      Display.__super__.constructor.call(this, element, options);
    }

    Display.prototype.addHelpers = function(res) {
      var context, ref, ref1;
      context = addHelpers(extend(true, res, this.extraContext), this.options.urlParams, this.options.currency, this.options.translations, this.options.templateFunctions);
      return extend(true, context, {
        is_first: res.page === 1,
        is_last: (ref = this.controller) != null ? (ref1 = ref.status) != null ? ref1.lastPageReached : void 0 : void 0
      });
    };


    /*
    render
    
    Replaces the older results in element with
    the given
    
    @param {Object} res
    @api public
     */

    Display.prototype.render = function(res) {
      this.element.html(this.mustache.render(this.template, this.addHelpers(res)));
      return this.trigger("df:rendered", [res]);
    };


    /*
    renderNext
    
    Replaces old results with the new ones in the element
    @param {Object} res
    @api public
     */

    Display.prototype.renderNext = function(res) {
      this.element.html(this.mustache.render(this.template, this.addHelpers(res)));
      return this.trigger("df:rendered", [res]);
    };


    /*
    clean
    
    Cleans the element's content.
    @api public
     */

    Display.prototype.clean = function() {
      this.element.html("");
      return this.trigger("df:cleaned");
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
