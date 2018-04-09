(function() {
  var $, Display, Pager, merge,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Display = require("./display");

  $ = require("../util/dfdom");

  merge = require("../util/merge");

  Pager = (function(superClass) {
    extend(Pager, superClass);

    Pager.defaultTemplate = "{{#pager}}\n  <ul class=\"df-pagination\">\n    <li class=\"df-page{{^previous}} df-page--disabled{{/previous}}\">\n      {{#previous}}\n      <a href=\"#page-{{.}}\" data-page=\"{{.}}\">\n        {{#translate}}{{previousLabel}}{{/translate}}\n      </a>\n      {{/previous}}\n      {{^previous}}\n      <span data-page=\"{{.}}\">\n        {{#translate}}{{previousLabel}}{{/translate}}\n      </span>\n      {{/previous}}\n    </li>\n    {{#first}}\n      <li class=\"df-page\">\n        <a href=\"#page-{{.}}\" data-page=\"{{.}}\">{{.}}</a>\n      </li>\n      <li class=\"df-page df-page--disabled\">\n        <span>…</span>\n      </li>\n    {{/first}}\n    {{#pages}}\n      <li class=\"df-page{{#current}} df-page--disabled{{/current}}\">\n        {{#current}}\n          <span data-page=\"{{page}}\">{{page}}</span>\n        {{/current}}\n        {{^current}}\n          <a href=\"#page-{{page}}\" data-page=\"{{page}}\">{{page}}</a>\n        {{/current}}\n      </li>\n    {{/pages}}\n    {{#last}}\n      <li class=\"df-page df-page--disabled\">\n        <span>…</span>\n      </li>\n      <li class=\"df-page\">\n        <a href=\"#page-{{.}}\" data-page=\"{{.}}\">{{.}}</a>\n      </li>\n    {{/last}}\n    <li class=\"df-page{{^next}} df-page--disabled{{/next}}\">\n      {{#next}}\n        <a href=\"#page-{{.}}\" data-page=\"{{.}}\">\n          {{#translate}}{{nextLabel}}{{/translate}}\n        </a>\n      {{/next}}\n      {{^next}}\n        <span data-page=\"{{.}}\">\n          {{#translate}}{{nextLabel}}{{/translate}}\n        </span>\n      {{/next}}\n    </li>\n  </ul>\n{{/pager}}";

    function Pager(element, options) {
      var defaults;
      defaults = {
        delta: 2,
        previousLabel: "Previous",
        nextLabel: "Next"
      };
      options = merge(defaults, options);
      Pager.__super__.constructor.call(this, element, options);
    }


    /**
     * Initialize: Listen to clicks on active pages
     */

    Pager.prototype.init = function() {
      if (!this.initialized) {
        this.element.on("click", "[data-page]", (function(_this) {
          return function(e) {
            var link;
            e.preventDefault();
            link = $(e.currentTarget);
            return _this.controller.getPage(parseInt(link.data("page"), 10));
          };
        })(this));
        return Pager.__super__.init.apply(this, arguments);
      }
    };


    /**
     * Builds context for the pager based on the current page.
     *
     * @param  {Number} page Current page.
     * @return {Object}      Data to be added to the context.
     */

    Pager.prototype.__buildPagerContext = function(page) {
      var firstPage, i, j, k, lastPage, n, nLinks, p, pager, pages, ref, ref1, ref2, ref3, results, results1, results2;
      firstPage = 1;
      lastPage = this.controller.lastPage;
      nLinks = 1 + this.options.delta * 2;
      if ((page - this.options.delta) <= this.options.delta) {
        pages = (function() {
          results = [];
          for (var i = 1, ref = Math.min(nLinks, lastPage); 1 <= ref ? i <= ref : i >= ref; 1 <= ref ? i++ : i--){ results.push(i); }
          return results;
        }).apply(this);
      } else if ((page + this.options.delta + 1) >= lastPage) {
        pages = (function() {
          results1 = [];
          for (var j = ref1 = Math.max(lastPage - nLinks + 1, firstPage); ref1 <= lastPage ? j <= lastPage : j >= lastPage; ref1 <= lastPage ? j++ : j--){ results1.push(j); }
          return results1;
        }).apply(this);
      } else {
        pages = (function() {
          results2 = [];
          for (var k = ref2 = page - this.options.delta, ref3 = page + this.options.delta; ref2 <= ref3 ? k <= ref3 : k >= ref3; ref2 <= ref3 ? k++ : k--){ results2.push(k); }
          return results2;
        }).apply(this);
      }
      return pager = {
        previous: (p = page - 1) < firstPage ? false : p,
        next: (n = page + 1) > lastPage ? false : n,
        first: pages[0] !== firstPage ? firstPage : false,
        last: pages.slice(-1)[0] !== lastPage ? lastPage : false,
        pages: pages.map(function(p) {
          return {
            page: p,
            current: p === page
          };
        }),
        previousLabel: this.options.previousLabel,
        nextLabel: this.options.nextLabel
      };
    };

    Pager.prototype.__buildContext = function(response) {
      var pager;
      if (response.total > response.results_per_page) {
        pager = this.__buildPagerContext(response.page);
      } else {
        pager = false;
      }
      return Pager.__super__.__buildContext.call(this, merge({
        pager: pager
      }, response));
    };

    return Pager;

  })(Display);

  module.exports = Pager;

}).call(this);
