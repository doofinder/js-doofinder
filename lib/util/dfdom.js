(function() {
  var DfDomElement, MATCHES_SELECTOR_FN, bean, dfdom;

  bean = require("bean");

  MATCHES_SELECTOR_FN = (['matches', 'webkitMatchesSelector', 'mozMatchesSelector', 'msMatchesSelector', 'oMatchesSelector', 'matchesSelector'].filter(function(funcName) {
    return typeof document.body[funcName] === 'function';
  })).pop();


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
      Object.defineProperty(this, 'len', {
        get: function() {
          return this.element.length;
        }
      });
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
        var results1;
        results1 = [];
        while (this.element.length > 0) {
          candidate = (this.element.splice(0, 1)).pop();
          this.element = this.element.filter(function(node) {
            return node !== candidate;
          });
          results1.push(candidate);
        }
        return results1;
      }).call(this);
      this.element = nodes;
      return this;
    };


    /**
     * Iterates over nodes in the store, passing them to the callback.
     * @public
     * @param  {Function} callback
     * @return {undefined}
     */

    DfDomElement.prototype.each = function(callback) {
      return this.element.forEach(callback);
    };


    /**
     * Iterates over nodes in the store, passing them to the callback, and stores
     * the result of the callback in an array.
     *
     * TODO: THIS SHOULD BE INTERNAL, CREATE A MAP FUNCTION THAT RETURNS A DfDomElement INSTANCE
     *
     * @public
     * @param  {Function} callback
     * @return {Array}
     */

    DfDomElement.prototype.map = function(callback) {
      return this.element.map(callback);
    };


    /**
     * Iterates over nodes in the store, passing them to a "finder" callback that
     * should return a NodeList (or compatible object) with nodes found for the
     * passed item. Found nodes are stored all together and returned at the end
     * of the function call.
     *
     * @protected
     * @param  {Function} finder Finder function that finds more nodes starting
     *                           from the received one.
     *
     * @return {Array}           Array with all the nodes found.
     */

    DfDomElement.prototype.__find = function(finder) {
      var results;
      results = [];
      this.each(function(rootNode) {
        var args, start;
        start = Math.max(results.length - 1, 0);
        args = [start, 0].concat(finder(rootNode));
        return Array.prototype.splice.apply(results, args);
      });
      return results;
    };


    /**
     * Finds nodes that match the passed selector starting from each element in
     * the store.
     *
     * @public
     * @param  {string} selector CSS Selector.
     * @return {DfDomElement}
     */

    DfDomElement.prototype.find = function(selector) {
      return new DfDomElement(this.__find((function(_this) {
        return function(item) {
          return _this.__fixNodeList(item.querySelectorAll(selector));
        };
      })(this)));
    };


    /**
     * Returns all the children of the elements in the store in a DfDomElement
     * instance.
     *
     * @public
     * @return {DfDomElement}
     */

    DfDomElement.prototype.children = function() {
      return new DfDomElement(this.__find((function(_this) {
        return function(item) {
          return _this.__fixNodeList(item.children);
        };
      })(this)));
    };


    /**
     * Returns a DfDomElement instance that contains the parent node of all the
     * elements in the current store. Duplicates are removed.
     *
     * @public
     * @return {DfDomElement}
     */

    DfDomElement.prototype.parent = function() {
      return new DfDomElement(this.map(function(item) {
        return item.parentElement;
      }));
    };


    /**
     * Returns a DfDomElement instance that contains all the parents of all the
     * elements in the store. Can be limited to nodes that match the provided
     * selector. Duplicates are removed.
     *
     * @public
     * @param  {string} selector Optional CSS Selector.
     * @return {DfDomElement}
     */

    DfDomElement.prototype.parents = function(selector) {
      var finder;
      finder = (function(_this) {
        return function(item) {
          var results;
          results = [];
          while (item.parentElement) {
            if ((selector == null) || item.parentElement[MATCHES_SELECTOR_FN](selector)) {
              results.push(item.parentElement);
            }
            item = item.parentElement;
          }
          return results;
        };
      })(this);
      return new DfDomElement(this.__find(finder));
    };


    /**
     * Returns a DfDomElement instance that contains the closest parent of all
     * the elements in the store. If a selector is provided, nodes must match
     * the selector to be selected.
     *
     * @public
     * @param  {string} selector Optional CSS Selector.
     * @return {DfDomElement}
     */

    DfDomElement.prototype.closest = function(selector) {
      return new DfDomElement(this.map(function(item) {
        return ((new DfDomElement(item)).parents(selector)).first()._get(0);
      }));
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
      if (key != null) {
        return this.element[key] || null;
      } else {
        return this.element;
      }
    };

    DfDomElement.prototype.length = function() {
      return this.element.length;
    };


    /**
     * Sets the HTML contents of each element in the set of matched elements. If
     * called with no arguments retrieves the HTML of the first element in the set
     * of matched elements.
     *
     * @public
     * @param  {string} htmlContent   HTML source code to insert. Optional.
     * @return {DfDomElement|string}  The same instance if is a set operation.
     *                                The HTML source code if is get operation.
     */

    DfDomElement.prototype.html = function(htmlContent) {
      if (htmlContent != null) {
        this.each(function(node) {
          return node.innerHTML = htmlContent;
        });
        return this;
      } else {
        return this._first().innerHTML;
      }
    };


    /**
     * Clones a HTMLElement node or returns the same if it's a HTML string.
     * @public
     * @param  {HTMLElement|string} node The node to be cloned.
     * @return {HTMLElement|string}      The copy or the same string.
     */

    DfDomElement.prototype.__cloneNode = function(node) {
      switch (false) {
        case typeof node !== "string":
          return node;
        case !(node instanceof HTMLElement):
          return node.cloneNode(true);
        default:
          throw "Invalid argument: " + node;
      }
    };


    /**
     * Appends a node or HTML into the set of matched elements. If the child is a
     * HTMLElement then new copies are created when there're more than 1 item in
     * the set. If the child is a DfDomElement instance, the first node of its set
     * of matched elements is used.
     *
     * @public
     * @param  {DfDomElement|HTMLElement|string} child Stuff to be appended.
     * @return {DfDomElement}                          The current instance.
     */

    DfDomElement.prototype.append = function(child) {
      if (child instanceof DfDomElement) {
        child = child.get(0);
      }
      if (child != null) {
        this.each((function(_this) {
          return function(node, i) {
            if (typeof child === "string") {
              return node.insertAdjacentHTML("beforeend", child);
            } else if (child instanceof HTMLElement) {
              return node.appendChild((i === 0 ? child : _this.__cloneNode(child)));
            }
          };
        })(this));
      }
      return this;
    };


    /**
     * Prepends a node or HTML into the set of matched elements. If the child is a
     * HTMLElement then new copies are created when there're more than 1 item in
     * the set. If the child is a DfDomElement instance, the first node of its set
     * of matched elements is used.
     *
     * @public
     * @param  {DfDomElement|HTMLElement|string} child Stuff to be prepended.
     * @return {DfDomElement}                          The current instance.
     */

    DfDomElement.prototype.prepend = function(child) {
      if (child instanceof DfDomElement) {
        child = child.get(0);
      }
      if (child != null) {
        this.each((function(_this) {
          return function(node, i) {
            var newChild, ref;
            if (typeof child === "string") {
              return node.insertAdjacentHTML("afterbegin", child);
            } else if (child instanceof HTMLElement) {
              newChild = (i === 0 ? child : _this.__cloneNode(child));
              if (((ref = node.children) != null ? ref.length : void 0) > 0) {
                return node.insertBefore(newChild, node.children[0]);
              } else {
                return node.appendChild(newChild);
              }
            }
          };
        })(this));
      }
      return this;
    };


    /**
     * Inserts a node or HTML before the set of matched elements. If the node is a
     * HTMLElement then new copies are created when there're more than 1 item in
     * the set. If the node is a DfDomElement instance, the first node of its set
     * of matched elements is used.
     *
     * @public
     * @param  {DfDomElement|HTMLElement|string} child Stuff to be inserted.
     * @return {DfDomElement}                          The current instance.
     */

    DfDomElement.prototype.before = function(sibling) {
      if (sibling instanceof DfDomElement) {
        sibling = sibling.get(0);
      }
      if (sibling != null) {
        this.each((function(_this) {
          return function(node, i) {
            var newSibling;
            if (typeof sibling === "string") {
              return node.insertAdjacentHTML("beforebegin", sibling);
            } else if (sibling instanceof HTMLElement) {
              newSibling = (i === 0 ? sibling : _this.__cloneNode(sibling));
              return node.parentElement.insertBefore(newSibling, node);
            }
          };
        })(this));
      }
      return this;
    };


    /**
     * Inserts a node or HTML after the set of matched elements. If the node is a
     * HTMLElement then new copies are created when there're more than 1 item in
     * the set. If the node is a DfDomElement instance, the first node of its set
     * of matched elements is used.
     *
     * @public
     * @param  {DfDomElement|HTMLElement|string} child Stuff to be inserted.
     * @return {DfDomElement}                          The current instance.
     */

    DfDomElement.prototype.after = function(sibling) {
      if (sibling instanceof DfDomElement) {
        sibling = sibling.get(0);
      }
      if (sibling != null) {
        this.each((function(_this) {
          return function(node, i) {
            var newSibling;
            if (typeof sibling === "string") {
              return node.insertAdjacentHTML("afterend", sibling);
            } else if (sibling instanceof HTMLElement) {
              newSibling = (i === 0 ? sibling : _this.__cloneNode(sibling));
              return node.parentElement.insertBefore(newSibling, node.nextSibling);
            }
          };
        })(this));
      }
      return this;
    };


    /**
     * Empties the nodes in the set of matched elements so there's no HTML inside.
     * @return {DfDomElement} Current instance.
     */

    DfDomElement.prototype.empty = function() {
      return this.html("");
    };


    /**
     * Get the value of an attribute for the first element in the set of matched
     * elements or set one or more attributes for every matched element.
     *
     * @public
     * @param  {string} name              Attribute name.
     * @param  {string} value             Attribute value.
     * @return {DfDomElement|string|null} Current instance on set, attribute
     *                                    value on get.
     */

    DfDomElement.prototype.attr = function(name, value) {
      var ref;
      if (value != null) {
        this.each(function(node) {
          return node.setAttribute(name, value);
        });
        return this;
      } else {
        return (ref = this._first()) != null ? ref.getAttribute(name) : void 0;
      }
    };


    /**
     * Removes an attribute from the set of matched elements.
     * @public
     * @param  {string} name          Attribute name.
     * @return {DfDomElement|string}  Current instance.
     */

    DfDomElement.prototype.removeAttr = function(name) {
      this.each(function(node) {
        return node.removeAttribute(name);
      });
      return this;
    };


    /**
     * Checks whether all the elements in the set of matched elements have certain
     * attribute or not.
     *
     * @public
     * @param  {string} name  Attribute name.
     * @return {Boolean}      true if the attribute is present.
     */

    DfDomElement.prototype.hasAttr = function(name) {
      return (this.element.filter(function(node) {
        return node.hasAttribute(name);
      })).length > 0;
    };


    /**
     * Shortcut to get or set data-* attributes' values for the set of matched
     * elements. When getting the value returns the value of the first element
     * in the set.
     *
     * @public
     * @param  {string} name              Attribute name.
     * @param  {string} value             Attribute value.
     * @return {DfDomElement|string|null} Current instance on set,
     *                                    data-attribute value on get.
     */

    DfDomElement.prototype.data = function(name, value) {
      return this.attr("data-" + name, value);
    };


    /**
     * Sets the value of the elements in the set of matched elements whose
     * prototype has `value` defined as a valid property. When no value is
     * provided, returns the value of the first element in the set, if it
     * supports it. Otherwise, returns undefined.
     *
     * @public
     * @param  {*} value Optional. The value that must be set for each element.
     * @return {*}       The value of the first element in the set, if supports
     *                   it.
     */

    DfDomElement.prototype.val = function(value) {
      var node, ref;
      if (value != null) {
        this.each(function(node) {
          if (node.__proto__.hasOwnProperty("value")) {
            return node.value = value;
          }
        });
        return this;
      } else if ((ref = (node = this._first())) != null ? ref.__proto__.hasOwnProperty("value") : void 0) {
        return node.value;
      } else {
        return void 0;
      }
    };


    /**
     * Adds a class name to all the elements in the set of matched elements.
     * @public
     * @param {string} className
     */

    DfDomElement.prototype.addClass = function(className) {
      this.each(function(node) {
        return node.classList.add(className);
      });
      return this;
    };


    /**
     * Checks whether all elements in the set of matched elements have a certain
     * class name.
     *
     * @public
     * @param {string} className
     */

    DfDomElement.prototype.hasClass = function(className) {
      return (this.element.filter(function(node) {
        return node.classList.contains(className);
      })).length > 0;
    };


    /**
     * Removes a class name from all the elements in the set of matched elements.
     * @public
     * @param {string} className
     */

    DfDomElement.prototype.removeClass = function(className) {
      this.each(function(node) {
        return node.classList.remove(className);
      });
      return this;
    };


    /**
     * Toggles the presence of certain class name for the elements in the set of
     * matched elements.
     *
     * @public
     * @param {string} className
     */

    DfDomElement.prototype.toggleClass = function(className) {
      this.each(function(node) {
        return node.classList.toggle(className);
      });
      return this;
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
