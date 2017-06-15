(function() {
  var DfDomElement, bean, dfdom;

  bean = require("bean");


  /**
   * DfDomElement
   * This class manages a set of DOM elements identified by a selector.
   */

  DfDomElement = (function() {

    /**
     * @public
     * @param  {string|String|HTMLElement|NodeList|Array} selector
     * @return {DfDomElement}
     */
    function DfDomElement(selector) {
      if (selector instanceof String) {
        selector = selector.toString();
      }
      if (typeof selector === "string") {
        selector = selector.split(",");
        if (selector.length === 0) {
          selector = selector[0];
        }
      }
      if (selector instanceof Array) {
        this.element = this.__initFromSelectorArray(selector);
      } else {
        this.element = this.__initFromSelector(selector);
      }
      this.__uniquify();
    }


    /**
     * Fixes the provided selector by:
     *
     * - Removing blanks.
     * - Changing the selection query for IDs starting by a number.
     *
     * @protected
     * @param  {string} selector A CSS selector.
     * @return {string}
     */

    DfDomElement.prototype.__fixSelector = function(selector) {
      selector = selector.trim();
      switch (false) {
        case !/^#\d/.test(selector):
          return "[id=\"" + (selector.substring(1)) + "\"]";
        default:
          return selector;
      }
    };


    /**
     * Converts a NodeList to an Array.
     * @protected
     * @param  {NodeList} nodeList A NodeList instance.
     * @return {Array}             An Array with the same nodes as the NodeList.
     */

    DfDomElement.prototype.__fixNodeList = function(nodeList) {
      return Array.prototype.slice.call(nodeList);
    };


    /**
     * Fills the internal store from an array of selectors.
     * @protected
     * @param  {Array} arr An Array of selectors (of all valid types)
     * @return {Array}     An Array of nodes.
     */

    DfDomElement.prototype.__initFromSelectorArray = function(arr) {
      var element;
      element = [];
      arr.forEach((function(_this) {
        return function(selector) {
          return element = element.concat(_this.__initFromSelector(selector));
        };
      })(this));
      return element;
    };


    /**
     * Fills the internal store from a selector.
     * @protected
     * @param  {string|HTMLElement|NodeList|Array} selector
     * @return {Array}     An Array of nodes.
     */

    DfDomElement.prototype.__initFromSelector = function(selector) {
      var element;
      if (typeof selector === "string") {
        element = this.__fixNodeList(document.querySelectorAll(this.__fixSelector(selector)));
      } else if (selector instanceof HTMLElement) {
        element = [selector];
      } else if (selector instanceof NodeList) {
        element = this.__fixNodeList(selector);
      } else {
        element = [];
      }
      return element;
    };


    /**
     * Removes duplicates from the internal store.
     * @protected
     * @return {DfDomElement} The current instance.
     */

    DfDomElement.prototype.__uniquify = function() {
      var candidate, nodes;
      nodes = (function() {
        var results;
        results = [];
        while (this.element.length > 0) {
          candidate = (this.element.splice(0, 1)).pop();
          this.element = this.element.filter(function(node) {
            return node !== candidate;
          });
          results.push(candidate);
        }
        return results;
      }).call(this);
      this.element = nodes;
      return this;
    };

    DfDomElement.prototype.each = function(callback) {
      return this.element.forEach(callback);
    };

    DfDomElement.prototype.find = function(selector) {
      var selectedNodes;
      selectedNodes = [];
      this.each(function(item) {
        return selectedNodes = selectedNodes.concat(Array.prototype.slice.call(item.querySelectorAll(selector)));
      });
      return new DfDomElement(selectedNodes);
    };

    DfDomElement.prototype.children = function() {
      var selectedNodes;
      selectedNodes = [];
      this.each(function(item) {
        return selectedNodes = selectedNodes.concat(Array.prototype.slice.call(item.children));
      });
      return new DfDomElement(selectedNodes);
    };

    DfDomElement.prototype.parent = function() {
      var selectedNodes;
      selectedNodes = [];
      this.each(function(item) {
        return selectedNodes.push(item.parentElement);
      });
      return new DfDomElement(selectedNodes);
    };

    DfDomElement.prototype.closest = function(selector) {
      var el, matchesFn, parent;
      matchesFn = null;
      el = this._first();
      ['matches', 'webkitMatchesSelector', 'mozMatchesSelector', 'msMatchesSelector', 'oMatchesSelector'].some(function(fn) {
        if (typeof document.body[fn] === 'function') {
          matchesFn = fn;
          return true;
        }
        return false;
      });
      parent = null;
      while (el) {
        parent = el.parentElement;
        if (parent && parent[matchesFn](selector)) {
          return new DfDomElement(parent);
        }
        el = parent;
      }
      return new DfDomElement([]);
    };

    DfDomElement.prototype.parents = function(selector) {
      var matchesFn, o, p, parents;
      matchesFn = null;
      ['matches', 'webkitMatchesSelector', 'mozMatchesSelector', 'msMatchesSelector', 'oMatchesSelector'].some(function(fn) {
        if (typeof document.body[fn] === 'function') {
          matchesFn = fn;
          return true;
        }
        return false;
      });
      parents = [];
      if (this._first() && this._first().parentElement) {
        p = this._first().parentElement;
        while (p !== null) {
          o = p;
          if ((selector == null) || o[matchesFn](selector)) {
            parents.push(o);
          }
          p = o.parentElement;
        }
      }
      return new DfDomElement(parents);
    };

    DfDomElement.prototype._first = function() {
      return this._get(0);
    };

    DfDomElement.prototype.first = function() {
      return new DfDomElement(this._first());
    };

    DfDomElement.prototype._get = function(key) {
      if (this.element && this.element.length > key) {
        return this.element[key];
      }
      return this.element;
    };

    DfDomElement.prototype.get = function(key) {
      return new DfDomElement(this._get(key));
    };

    DfDomElement.prototype.length = function() {
      return this.element.length;
    };

    DfDomElement.prototype.html = function(htmlString) {
      this.each(function(elem) {
        return elem.innerHTML = htmlString;
      });
      return this;
    };

    DfDomElement.prototype.append = function(fragment) {
      this.each(function(elem) {
        if (typeof fragment === "string" && (elem.insertAdjacentHTML != null)) {
          return elem.insertAdjacentHTML("beforeend", fragment);
        } else if (typeof fragment === "string" && (elem.insertAdjacentHTML == null)) {
          return elem.innerHTML += fragment;
        } else if (fragment.tagName != null) {
          return elem.appendChild(fragment);
        } else if (fragment._first != null) {
          return elem.appendChild(fragment._first());
        }
      });
      return this;
    };

    DfDomElement.prototype.prepend = function(fragment) {
      return this.each(function(elem) {
        if (typeof fragment === "string" && (elem.insertAdjacentHTML != null)) {
          return elem.insertAdjacentHTML("afterbegin", fragment);
        } else if (typeof fragment === "string" && (elem.insertAdjacentHTML == null)) {
          return elem.innerHTML = fragment + elem.innerHTML;
        } else {
          if (!fragment.tagName) {
            fragment = fragment._first();
          }
          if (elem.children && elem.children.length > 0) {
            return elem.insertBefore(fragment, elem.children[0]);
          } else {
            return elem.appendChild(fragment);
          }
        }
      });
    };

    DfDomElement.prototype.before = function(fragment) {
      return this.each(function(elem) {
        if (typeof fragment === "string") {
          return elem.insertAdjacentHTML("beforebegin", fragment);
        } else if (fragment.tagName) {
          return elem.parentElement.insertBefore(fragment, elem);
        } else {
          return elem.parentElement.insertBefore(fragment._first(), elem);
        }
      });
    };

    DfDomElement.prototype.after = function(fragment) {
      this.each(function(elem) {
        if (typeof fragment === "string") {
          return elem.insertAdjacentHTML("afterend", fragment);
        } else if (fragment.tagName) {
          return elem.parentElement.appendChild(fragment);
        } else {
          return elem.parentElement.appendChild(fragment._first());
        }
      });
      return this;
    };

    DfDomElement.prototype.empty = function(htmlString) {
      return this.html("");
    };

    DfDomElement.prototype.attr = function(key, value) {
      var first;
      first = this._first();
      if ((first != null ? first.getAttribute : void 0) != null) {
        if (typeof value !== "undefined") {
          first.setAttribute(key, value);
        }
        return first.getAttribute(key);
      }
    };

    DfDomElement.prototype.removeAttr = function(key) {
      this.each(function(item) {
        return item.removeAttribute(key);
      });
      return this;
    };

    DfDomElement.prototype.hasAttr = function(key) {
      return (this.attr(key) != null) && this.attr(key) !== "";
    };

    DfDomElement.prototype.data = function(key, value) {
      var actualKey;
      actualKey = "data-" + key;
      return this.attr(actualKey, value);
    };

    DfDomElement.prototype.val = function(value) {
      if (typeof value !== "undefined") {
        this._first().value = value;
      }
      return this._first().value;
    };

    DfDomElement.prototype.width = function() {
      var ref;
      return (ref = this._first()) != null ? ref.offsetWidth : void 0;
    };

    DfDomElement.prototype.height = function() {
      var ref;
      return (ref = this._first()) != null ? ref.offsetHeight : void 0;
    };

    DfDomElement.prototype._clientRect = function() {
      var ref;
      return (ref = this._first()) != null ? typeof ref.getBoundingClientRect === "function" ? ref.getBoundingClientRect() : void 0 : void 0;
    };

    DfDomElement.prototype.top = function() {
      var ref;
      return ((ref = this._clientRect()) != null ? ref.top : void 0) || 0;
    };

    DfDomElement.prototype.right = function() {
      var ref;
      return ((ref = this._clientRect()) != null ? ref.right : void 0) || 0;
    };

    DfDomElement.prototype.bottom = function() {
      var ref;
      return ((ref = this._clientRect()) != null ? ref.bottom : void 0) || 0;
    };

    DfDomElement.prototype.left = function() {
      var ref;
      return ((ref = this._clientRect()) != null ? ref.left : void 0) || 0;
    };

    DfDomElement.prototype.scrollTop = function(value) {
      if (typeof value !== "undefined") {
        this._first().scrollTop = value;
      }
      return this._first().scrollY || this._first().scrollTop;
    };

    DfDomElement.prototype.scrollLeft = function() {
      return this._first().scrollLeft;
    };

    DfDomElement.prototype.addClass = function(className) {
      this.each(function(elem) {
        return elem.classList.add(className);
      });
      return this;
    };

    DfDomElement.prototype.removeClass = function(className) {
      this.each(function(elem) {
        return elem.classList.remove(className);
      });
      return this;
    };

    DfDomElement.prototype.toggleClass = function(className) {
      this.each(function(elem) {
        return elem.classList.toggle(className);
      });
      return this;
    };

    DfDomElement.prototype.hasClass = function(className) {
      return this._first().classList.contains(className);
    };

    DfDomElement.prototype.css = function(key, value) {
      this.each(function(elem) {
        return elem.style[key] = value;
      });
      return getComputedStyle(this._first())[key];
    };

    DfDomElement.prototype.hide = function() {
      return this.css("display", "none");
    };

    DfDomElement.prototype.show = function() {
      return this.css("display", "block");
    };

    DfDomElement.prototype.remove = function() {
      var first;
      first = this._first();
      if ((first != null) && (first.parentNode != null)) {
        return first.parentNode.removeChild(this._first());
      }
    };

    DfDomElement.prototype.on = function(arg1, arg2, arg3) {
      if (arg3 != null) {
        this.each(function(elem) {
          if (elem != null) {
            return bean.on(elem, arg1, arg2, arg3);
          }
        });
      } else {
        this.each(function(elem) {
          if (elem != null) {
            return bean.on(elem, arg1, arg2);
          }
        });
      }
      return this;
    };

    DfDomElement.prototype.one = function(arg1, arg2, arg3) {
      if (arg3 != null) {
        this.each(function(elem) {
          if (elem != null) {
            return bean.one(elem, arg1, arg2, arg3);
          }
        });
      } else {
        this.each(function(elem) {
          if (elem != null) {
            return bean.one(elem, arg1, arg2);
          }
        });
      }
      return this;
    };

    DfDomElement.prototype.trigger = function(event, params) {
      this.each(function(elem) {
        if (elem != null) {
          return bean.fire(elem, event, params);
        }
      });
      return this;
    };

    DfDomElement.prototype.off = function(event) {
      this.each(function(elem) {
        if (elem != null) {
          return bean.off(elem, event);
        }
      });
      return this;
    };

    DfDomElement.prototype.focus = function() {
      if (this._first() != null) {
        return this._first().focus();
      }
    };

    DfDomElement.prototype.blur = function() {
      if (this._first() != null) {
        return this._first().blur();
      }
    };

    return DfDomElement;

  })();

  dfdom = function(selector) {
    if (selector != null) {
      switch (false) {
        case !(selector instanceof DfDomElement):
          return selector;
        default:
          return new DfDomElement(selector);
      }
    }
  };

  module.exports = dfdom;

}).call(this);
