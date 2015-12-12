
/*
queryinput.coffee
author: @ecoslado
2015 11 21
 */

(function() {
  var $, QueryInput, QueryInputMobile,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  $ = require('../util/jquery');

  QueryInput = require('./queryinput');


  /*
  QueryInput
  
  This class gets the query and
  calls controller's search method.
  Gets the string from an input when
  receives more than given number of
  characters (3 by default).
   */

  QueryInputMobile = (function(superClass) {
    extend(QueryInputMobile, superClass);


    /*
    constructor
    
    Just to set the queryInput
    
    @param {String} queryInput
    @param {Object} options
    @api public
     */

    function QueryInputMobile(queryInput, options) {
      var css, tmp;
      this.queryInput = queryInput;
      if (options == null) {
        options = {};
      }
      QueryInputMobile.__super__.constructor.call(this, this.queryInput);
      this.launchOnClick = options.launchOnClick;
      this.lang = options.lang ? options.lang : "en";
      this.endpoint = options.endpoint;
      if (this.queryInput.length === 0) {
        console.warn("Doofinder: Query input does not exist.");
      }
      this.form = this.queryInput.closest('form').first();
      if (!options.form) {
        options.form = {};
      }
      if (this.form.length === 0) {
        css = options.form.css;
        this.wrappedInput = this.queryInput;
        if (css === null) {
          css = {
            display: 'inline-block',
            boxSizing: 'border-box',
            width: 0,
            height: 0,
            overflow: 'visible',
            backgroundColor: 'transparent',
            borderWidth: 0
          };
        }
        if (options.form.wraps !== null) {
          tmp = $(options.form.wraps);
          if (tmp.length >= 1) {
            this.wrappedInput = tmp.get(0);
          }
        }
        this.form = $('<form>').css(css);
        this.form.insertBefore(this.wrappedInput).append(this.wrappedInput);
      }
    }


    /*
    start
    
    This is the function where bind the
    events to DOM elements.
    @api public
     */

    QueryInputMobile.prototype.init = function(controller) {
      var _this;
      this.controller = controller;
      _this = this;
      if (this.launchOnClick) {
        this.queryInput.on('click', function(e) {
          e.preventDefault();
          return _this.launchMobileVersion(false);
        });
      }
      this.form.removeAttr('onsubmit');
      this.form.attr('method', 'get').attr('action', this.getMobileVersionURL());
      this.form.on('submit', function(e) {
        e.preventDefault();
        _this.launchMobileVersion.call(_this);
        return false;
      });
      if (this.form.find('input[type="submit"], button[type="submit"]').length === 0) {
        return this.queryInput.on('keypress', function(e) {
          if (e.keyCode === 13) {
            return _this.form.trigger('submit');
          }
        });
      }
    };

    QueryInputMobile.prototype.launchMobileVersion = function(query) {
      var url;
      url = this.getMobileVersionURL();
      if (typeof query === 'undefined') {
        query = this.queryInput.val();
      } else if (query === false) {
        query = '';
      }
      query = $.trim(query);
      if (query.length > 0) {
        url = url + '?query=' + query;
      }
      return window.location.href = url;
    };

    QueryInputMobile.prototype.getMobileVersionURL = function() {
      var pattern, protocol;
      protocol = '//';
      pattern = /-app.doofinder.com/;
      if (!pattern.test(this.options.endpoint)) {
        protocol = 'http://';
      }
      return "" + protocol + this.endpoint + "/" + this.lang + "/mobile/" + this.controller.client.hashid;
    };

    return QueryInputMobile;

  })(QueryInput);

  module.exports = QueryInputMobile;

}).call(this);
