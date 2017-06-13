
/*
dfdom.coffee
author: @ecoslado
2016 07 05
 */

(function() {
  var DfDomElement, bean, dfdom;

  bean = require("bean");


  /*
  DfDomElement
  This class manages an set of
  DOM elements identified by a selector
   */

  DfDomElement = (function() {
    function DfDomElement(element) {
      var selector;
      this.element = element;
      if (typeof this.element === "string") {
        selector = /^#\d/.test(this.element) ? "[id=\"" + (this.element.substring(1)) + "\"]" : this.element;
        this.element = Array.prototype.slice.call(document.querySelectorAll(selector));
      } else if (this.element.element != null) {
        this.element = this.element.element;
      } else if (this.element.constructor !== Array) {
        this.element = [this.element];
      }
      return this;
    }

    DfDomElement.prototype.find = function(selector) {
      var selectedNodes;
      selectedNodes = [];
      this.each(function(item) {
        return selectedNodes = selectedNodes.concat(Array.prototype.slice.call(item.querySelectorAll(selector)));
      });
      return new DfDomElement(selectedNodes);
    };

    DfDomElement.prototype.each = function(callback) {
      return this.element.forEach(callback);
    };

    DfDomElement.prototype.children = function() {
      return new DfDomElement(Array.prototype.slice.call(this._first().children));
    };

    DfDomElement.prototype.parent = function() {
      return new DfDomElement(this._first().parentElement);
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
      if ((first != null) && (first.getAttribute != null)) {
        if (typeof value !== "undefined") {
          first.setAttribute(key, value);
        }
        return first.getAttribute(key);
      }
    };

    DfDomElement.prototype.removeAttr = function(key) {
      var first;
      first = this._first();
      if ((first != null) && (first.removeAttribute != null)) {
        first.removeAttribute(key);
      }
      return this;
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
      return new DfDomElement(selector);
    }
  };

  module.exports = dfdom;

}).call(this);
