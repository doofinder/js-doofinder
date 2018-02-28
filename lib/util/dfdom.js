(function() {
  var DfDomElement, MATCHES_SELECTOR_FN, Text, Thing, bean, extend, getWindow, matchesSelector;

  bean = require("bean");

  extend = require("extend");

  Text = require("./text");

  Thing = require("./thing");

  MATCHES_SELECTOR_FN = null;

  matchesSelector = function(node, selector) {
    if (MATCHES_SELECTOR_FN == null) {
      MATCHES_SELECTOR_FN = (['matches', 'webkitMatchesSelector', 'mozMatchesSelector', 'msMatchesSelector', 'oMatchesSelector', 'matchesSelector'].filter(function(funcName) {
        return Thing.is.fn(node[funcName]);
      })).pop();
    }
    return node[MATCHES_SELECTOR_FN](selector);
  };

  getWindow = function(node) {
    var view;
    if (Thing.is.window(node)) {
      view = node;
    } else if (Thing.is.document(node)) {
      view = node.defaultView;
    } else if (node.ownerDocument != null) {
      view = node.ownerDocument.defaultView;
    } else {
      view = null;
    }
    if (view && view.opener) {
      return view;
    } else {
      return window;
    }
  };


  /**
   * DfDomElement
   * This class manages a set of DOM elements identified by a selector.
   */

  DfDomElement = (function() {

    /**
     * @public
     * @param  {String|Element|NodeList|Array} selector
     * @return {DfDomElement}
     */
    function DfDomElement(selector) {
      Object.defineProperty(this, 'length', {
        get: function() {
          return this.element.length;
        }
      });
      if (Thing.is.string(selector)) {
        selector = selector.toString().trim();
        if (selector.length === 0) {
          selector = [];
        } else {
          selector = (selector.split(",")).map(function(s) {
            return s.trim();
          });
        }
      }
      if (Thing.is.array(selector)) {
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
     * @param  {String} selector A CSS selector.
     * @return {String}
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
     * Returns true if a DfDomElement instance can be created for the provided
     * node.
     *
     * @protected
     * @param  {HTMLElement|HTMLBodyElement|HTMLDocument|Document|Window} node
     * @return {Boolean}
     */

    DfDomElement.prototype.__isValidElementNode = function(node) {
      return (Thing.is.element(node)) || (Thing.is.document(node)) || (Thing.is.window(node));
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
     * @param  {String|Element|NodeList|Array} selector
     * @return {Array}     An Array of nodes.
     */

    DfDomElement.prototype.__initFromSelector = function(selector) {
      if (selector instanceof NodeList) {
        return this.__fixNodeList(selector);
      } else if (Thing.is.string(selector) && selector.length > 0) {
        return this.__fixNodeList(document.querySelectorAll(this.__fixSelector(selector)));
      } else if (this.__isValidElementNode(selector)) {
        return [selector];
      } else {
        return [];
      }
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
     * Iterates nodes in the set of matched elements, passing them to a "finder"
     * callback that should return a NodeList (or compatible object) with nodes
     * found for the passed item. Found nodes are stored all together and returned
     * at the end of the function call.
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

    DfDomElement.prototype.get = function(index) {
      if (index != null) {
        return this.element[index] || null;
      } else {
        return this.element;
      }
    };


    /**
     * Reduces the set of matched elements to the first one from the set of
     * matched elements.
     *
     * @public
     * @return {DfDomElement}
     */

    DfDomElement.prototype.first = function() {
      return this.item(0);
    };


    /**
     * Reduces the set of matched elements to the last one from the set of
     * matched elements.
     *
     * @public
     * @return {DfDomElement}
     */

    DfDomElement.prototype.last = function() {
      return this.item(-1);
    };


    /**
     * Reduces the set of matched elements to the one at the specified index.
     * Providing a negative number indicates a position starting from the end of
     * the set, rather than the beginning.
     *
     * @public
     * @param  {Number} index
     * @return {DfDomElement}
     */

    DfDomElement.prototype.item = function(index) {
      return new DfDomElement(this.element[index >= 0 ? index : this.length + index] || []);
    };


    /**
     * Iterates nodes in the set of matched elements, passing them to the
     * callback.
     *
     * @public
     * @param  {Function} callback
     * @return {DfDomElement}
     */

    DfDomElement.prototype.each = function(callback) {
      this.element.forEach(callback, this);
      return this;
    };


    /**
     * Reduce the set of matched elements to those for which the function doesn't
     * return null or undefined.
     *
     * @public
     * @param  {Function} callback
     * @return {DfDomElement}
     */

    DfDomElement.prototype.map = function(callback) {
      return new DfDomElement((this.element.map(callback)).filter(function(node) {
        return node != null;
      }));
    };


    /**
     * Reduce the set of matched elements to those match the selector or pass the
     * function's test.
     *
     * @public
     * @param  {Function|String} callback Function
     * @return {DfDomElement}
     */

    DfDomElement.prototype.filter = function(selector_or_fn) {
      var filterFn;
      if (Thing.is.fn(selector_or_fn)) {
        filterFn = selector_or_fn;
      } else {
        filterFn = function(node) {
          return matchesSelector(node, selector_or_fn);
        };
      }
      return new DfDomElement(this.element.filter(filterFn, this));
    };


    /**
     * Finds nodes that match the passed selector starting from each element in
     * the store.
     *
     * @public
     * @param  {String} selector CSS Selector.
     * @return {DfDomElement}
     */

    DfDomElement.prototype.find = function(selector) {
      var finderFn;
      finderFn = (function(_this) {
        return function(node) {
          var src;
          src = Thing.is.window(node) ? window.document : node;
          return _this.__fixNodeList(src.querySelectorAll(selector));
        };
      })(this);
      return new DfDomElement(this.__find(finderFn));
    };


    /**
     * Returns all the children of the elements in the set of matched elements in a DfDomElement
     * instance.
     *
     * @public
     * @return {DfDomElement}
     */

    DfDomElement.prototype.children = function() {
      var finderFn;
      finderFn = (function(_this) {
        return function(node) {
          return _this.__fixNodeList(node.children);
        };
      })(this);
      return new DfDomElement(this.__find(finderFn));
    };


    /**
     * Returns all the siblings of the elements in the set of matched elements
     * in a DfDomElement instance.
     *
     * @public
     * @return {DfDomElement}
     */

    DfDomElement.prototype.siblings = function() {
      var nodes;
      nodes = [];
      this.each(function(x) {
        var args, n;
        n = nodes.length;
        args = ((new DfDomElement(x)).parent().children().filter(function(node) {
          return node !== x;
        })).get();
        args.splice(0, 0, n, 0);
        return Array.prototype.splice.apply(nodes, args);
      });
      return new DfDomElement(nodes);
    };


    /**
     * Returns a DfDomElement instance that contains the parent node of all the
     * elements in the current store. Duplicates are removed.
     *
     * @public
     * @return {DfDomElement}
     */

    DfDomElement.prototype.parent = function() {
      return new DfDomElement(this.element.map((function(node) {
        return node.parentElement;
      }), this));
    };


    /**
     * Returns a DfDomElement instance that contains all the parents of all the
     * elements in the set of matched elements. Can be limited to nodes that match
     * the provided selector. Duplicates are removed.
     *
     * @public
     * @param  {String} selector Optional CSS Selector.
     * @return {DfDomElement}
     */

    DfDomElement.prototype.parents = function(selector) {
      var finder;
      finder = (function(_this) {
        return function(item) {
          var results;
          results = [];
          while (item.parentElement) {
            if ((selector == null) || matchesSelector(item.parentElement, selector)) {
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
     * the elements in the set of matched elements. If a selector is provided,
     * nodes must match the selector to be selected.
     *
     * @public
     * @param  {String} selector Optional CSS Selector.
     * @return {DfDomElement}
     */

    DfDomElement.prototype.closest = function(selector) {
      var mapperFn;
      mapperFn = function(node) {
        return ((new DfDomElement(node)).parents(selector)).get(0);
      };
      return new DfDomElement(this.element.map(mapperFn, this));
    };


    /**
     * Sets the HTML contents of each element in the set of matched elements. If
     * called with no arguments retrieves the HTML of the first element in the set
     * of matched elements.
     *
     * @public
     * @param  {String} htmlContent   HTML source code to insert. Optional.
     * @return {DfDomElement|String}  The same instance if is a set operation.
     *                                The HTML source code if is get operation.
     */

    DfDomElement.prototype.html = function(htmlContent) {
      if (htmlContent != null) {
        return this.each(function(node) {
          return node.innerHTML = htmlContent;
        });
      } else {
        return (this.get(0)).innerHTML;
      }
    };


    /**
     * Clones an Element node or returns a copy of the same value if it's a
     * HTML string.
     *
     * @public
     * @param  {Element|String} node The node to be cloned.
     * @return {Element|String}      The copy or the same string.
     */

    DfDomElement.prototype.__cloneNode = function(node) {
      if (Thing.is.string(node)) {
        return node;
      } else if (Thing.is.element(node)) {
        return node.cloneNode(true);
      } else {
        throw "Invalid argument: " + node;
      }
    };


    /**
     * Prepends a node or HTML into the set of matched elements. If the child is a
     * Element then new copies are created when there're more than 1 item in
     * the set. If the child is a DfDomElement instance, all its matched elements
     * are "prepended" individually.
     *
     * @public
     * @param  {DfDomElement|Element|String} child Stuff to be prepended.
     * @return {DfDomElement}                      The current instance.
     */

    DfDomElement.prototype.prepend = function(child) {
      if (child instanceof DfDomElement) {
        child = child.get();
      }
      if (Thing.is.array(child)) {
        child.forEach((function(_this) {
          return function(node) {
            return _this.prepend(node);
          };
        })(this));
        return this;
      } else {
        return this.each((function(_this) {
          return function(node, i) {
            var newChild;
            if (Thing.is.string(child)) {
              return node.insertAdjacentHTML("afterbegin", child);
            } else if (Thing.is.element(child)) {
              newChild = (i === 0 ? child : _this.__cloneNode(child));
              if (node.children.length > 0) {
                return node.insertBefore(newChild, node.children[0]);
              } else {
                return node.appendChild(newChild);
              }
            }
          };
        })(this));
      }
    };


    /**
     * Appends a node or HTML into the set of matched elements. If the child is a
     * Element then new copies are created when there're more than 1 item in
     * the set. If the child is a DfDomElement instance, all its matched elements
     * are appended individually.
     *
     * @public
     * @param  {DfDomElement|Element|String} child Stuff to be appended.
     * @return {DfDomElement}                          The current instance.
     */

    DfDomElement.prototype.append = function(child) {
      if (child instanceof DfDomElement) {
        child = child.get();
      }
      if (Thing.is.array(child)) {
        child.forEach((function(_this) {
          return function(node) {
            return _this.append(node);
          };
        })(this));
        return this;
      } else {
        return this.each((function(_this) {
          return function(node, i) {
            if (Thing.is.string(child)) {
              return node.insertAdjacentHTML("beforeend", child);
            } else if (Thing.is.element(child)) {
              return node.appendChild((i === 0 ? child : _this.__cloneNode(child)));
            }
          };
        })(this));
      }
    };


    /**
     * Inserts a node or HTML before the set of matched elements. If the node is
     * an Element then new copies are created when there're more than 1 item in
     * the set. If the node is a DfDomElement instance, all its matched elements
     * are inserted before the current set.
     *
     * @public
     * @param  {DfDomElement|Element|String} child Stuff to be inserted.
     * @return {DfDomElement}                          The current instance.
     */

    DfDomElement.prototype.before = function(sibling) {
      if (sibling instanceof DfDomElement) {
        sibling = sibling.get();
      }
      if (Thing.is.array(sibling)) {
        sibling.forEach((function(_this) {
          return function(node) {
            return _this.before(node);
          };
        })(this));
        return this;
      } else {
        return this.each((function(_this) {
          return function(node, i) {
            var newSibling;
            if (Thing.is.string(sibling)) {
              return node.insertAdjacentHTML("beforebegin", sibling);
            } else if (Thing.is.element(sibling)) {
              newSibling = (i === 0 ? sibling : _this.__cloneNode(sibling));
              return node.parentElement.insertBefore(newSibling, node);
            }
          };
        })(this));
      }
    };


    /**
     * Inserts a node or HTML after the set of matched elements. If the node is
     * an Element then new copies are created when there're more than 1 item in
     * the set. If the node is a DfDomElement instance, all its matched elements
     * are inserted before the current set.
     *
     * @public
     * @param  {DfDomElement|Element|String} child Stuff to be inserted.
     * @return {DfDomElement}                          The current instance.
     */

    DfDomElement.prototype.after = function(sibling) {
      if (sibling instanceof DfDomElement) {
        sibling = sibling.get();
      }
      if (Thing.is.array(sibling)) {
        sibling.forEach((function(_this) {
          return function(node) {
            return _this.after(node);
          };
        })(this));
        return this;
      } else {
        return this.each((function(_this) {
          return function(node, i) {
            var newSibling;
            if (Thing.is.string(sibling)) {
              return node.insertAdjacentHTML("afterend", sibling);
            } else if (Thing.is.element(sibling)) {
              newSibling = (i === 0 ? sibling : _this.__cloneNode(sibling));
              return node.parentElement.insertBefore(newSibling, node.nextSibling);
            }
          };
        })(this));
      }
    };


    /**
     * Empties the nodes in the set of matched elements so there's no HTML inside.
     * @public
     * @return {DfDomElement} Current instance.
     */

    DfDomElement.prototype.empty = function() {
      return this.html("");
    };


    /**
     * Removes the nodes in the set of matched elements.
     * @public
     * @return {DfDomElement} Current instance.
     */

    DfDomElement.prototype.remove = function() {
      return this.each(function(node) {
        var ref;
        return (ref = node.parentNode) != null ? ref.removeChild(node) : void 0;
      });
    };


    /**
     * Get the value of an attribute for the first element in the set of matched
     * elements or set one or more attributes for every matched element.
     *
     * @public
     * @param  {String} name              Attribute name.
     * @param  {String} value             Attribute value.
     * @return {DfDomElement|String|null} Current instance on set, attribute
     *                                    value on get.
     */

    DfDomElement.prototype.attr = function(name, value) {
      var ref;
      if (value != null) {
        return this.each(function(node) {
          return node.setAttribute(name, value);
        });
      } else {
        return (ref = this.get(0)) != null ? ref.getAttribute(name) : void 0;
      }
    };


    /**
     * Removes an attribute from the set of matched elements.
     * @public
     * @param  {String} name          Attribute name.
     * @return {DfDomElement|String}  Current instance.
     */

    DfDomElement.prototype.removeAttr = function(name) {
      return this.each(function(node) {
        return node.removeAttribute(name);
      });
    };


    /**
     * Checks whether all the elements in the set of matched elements have certain
     * attribute or not.
     *
     * @public
     * @param  {String} name  Attribute name.
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
     * @param  {String} name              Attribute name.
     * @param  {String} value             Attribute value.
     * @return {DfDomElement|String|null} Current instance on set,
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
        return this.each(function(node) {
          if (node.value != null) {
            return node.value = value;
          }
        });
      } else if (((ref = (node = this.get(0))) != null ? ref.value : void 0) != null) {
        return node.value;
      } else {
        return void 0;
      }
    };


    /**
     * Adds a class name to all the elements in the set of matched elements.
     * @public
     * @param {String} className
     */

    DfDomElement.prototype.addClass = function(className) {
      return this.each(function(node) {
        return node.classList.add(className);
      });
    };


    /**
     * Checks whether all elements in the set of matched elements have a certain
     * class name.
     *
     * @public
     * @param {String} className
     */

    DfDomElement.prototype.hasClass = function(className) {
      var x;
      x = this.length;
      return (this.element.filter(function(node) {
        return node.classList.contains(className);
      })).length === x;
    };


    /**
     * Removes a class name from all the elements in the set of matched elements.
     * @public
     * @param {String} className
     */

    DfDomElement.prototype.removeClass = function(className) {
      return this.each(function(node) {
        return node.classList.remove(className);
      });
    };


    /**
     * Toggles the presence of certain class name for the elements in the set of
     * matched elements.
     *
     * @public
     * @param {String} className
     */

    DfDomElement.prototype.toggleClass = function(className) {
      return this.each(function(node) {
        return node.classList.toggle(className);
      });
    };


    /**
     * Gets the value of a computed style property for the first element in the
     * set of matched elements or set one or more CSS properties for every matched
     * element.
     *
     * Note: the computed style of an element may not be the same as the value
     * specified in the style sheet and it depends on the browser's quirks.
     *
     * @public
     * @param  {String}         propertyName
     * @param  {String|Number}  value
     * @param  {String}         priority      The proper way to set !important
     * @return {DfDomElement|String|null} Current instance on set, value or null
     *                                    on get.
     */

    DfDomElement.prototype.css = function(propertyName, value, priority) {
      var node, propName;
      if (value != null) {
        propName = Text.dash2camel(propertyName);
        value = priority != null ? value + "!" + priority : "" + value;
        return this.each(function(node) {
          return node.style[propName] = value;
        });
      } else if ((node = this.get(0)) != null) {
        propName = Text.camel2dash(propertyName);
        return ((getWindow(node)).getComputedStyle(node)).getPropertyValue(propName);
      }
    };


    /**
     * Hides the element in the set of matched elements by setting their display
     * property to "none".
     *
     * @public
     * @return {DfDomElement} Current instance.
     */

    DfDomElement.prototype.hide = function() {
      return this.css("display", "none");
    };


    /**
     * Displays the elements in the set of matched elements by unsetting their
     * display property.
     *
     * @public
     * @return {DfDomElement} Current instance.
     */

    DfDomElement.prototype.show = function() {
      return this.each(function(node) {
        return node.style.removeProperty("display");
      });
    };


    /**
     * Returns the size of the first element in the set of matched elements and
     * its position relative to the viewport.
     *
     * @protected
     * @return {DOMRect} The returned value is a DOMRect object, which contains
     *                   read-only left, top, right, bottom, x, y, width, height
     *                   properties describing the border-box in pixels. # MDN #
     */

    DfDomElement.prototype.box = function() {
      var box, doc, isDoc, isElm, j, k, keys, l, len, len1, node, rect;
      node = this.get(0);
      keys = ['left', 'top', 'right', 'bottom', 'width', 'height', 'scrollLeft', 'scrollTop', 'scrollWidth', 'scrollHeight'];
      rect = {};
      for (j = 0, len = keys.length; j < len; j++) {
        k = keys[j];
        rect[k] = 0;
      }
      if (node != null) {
        if (Thing.is.window(node)) {
          doc = this.document();
          rect = extend(rect, {
            width: node.outerWidth,
            height: node.outerHeight,
            clientWidth: node.innerWidth,
            clientHeight: node.innerHeight,
            scrollLeft: node.scrollX,
            scrollTop: node.scrollY,
            scrollWidth: doc.scrollWidth,
            scrollHeight: doc.scrollHeight
          });
        } else {
          isDoc = Thing.is.document(node);
          isElm = node.getBoundingClientRect != null;
          if (isDoc) {
            node = node.documentElement;
            rect = extend(rect, {
              width: node.offsetWidth,
              height: node.offsetHeight
            });
          }
          if (isElm) {
            box = node.getBoundingClientRect();
            for (l = 0, len1 = keys.length; l < len1; l++) {
              k = keys[l];
              rect[k] = box[k];
            }
          }
          if (isDoc || isElm) {
            rect = extend(rect, {
              clientWidth: node.clientWidth,
              clientHeight: node.clientHeight,
              scrollLeft: node.scrollLeft,
              scrollTop: node.scrollTop,
              scrollWidth: node.scrollWidth,
              scrollHeight: node.scrollHeight
            });
          }
        }
        return rect;
      }
    };


    /**
     * Proxy method for getBoundingClientRect().width. Returns the width of the
     * first element in the set of matched elements.
     *
     * @public
     * @return {Number} The width of the element.
     */

    DfDomElement.prototype.width = function() {
      var ref;
      return (ref = this.box()) != null ? ref.width : void 0;
    };


    /**
     * Proxy method for getBoundingClientRect().height. Returns the height of the
     * first element in the set of matched elements.
     *
     * @public
     * @return {Number} The height of the element.
     */

    DfDomElement.prototype.height = function() {
      var ref;
      return (ref = this.box()) != null ? ref.height : void 0;
    };


    /**
     * Proxy method for getBoundingClientRect().top. Returns the top position of
     * the first element in the set of matched elements. Position is relative to
     * the viewport.
     *
     * @public
     * @return {Number} The top position of the element.
     */

    DfDomElement.prototype.top = function() {
      var ref;
      return (ref = this.box()) != null ? ref.top : void 0;
    };


    /**
     * Proxy method for getBoundingClientRect().right. Returns the right position of
     * the first element in the set of matched elements. Position is relative to
     * the viewport.
     *
     * @public
     * @return {Number} The right position of the element.
     */

    DfDomElement.prototype.right = function() {
      var ref;
      return (ref = this.box()) != null ? ref.right : void 0;
    };


    /**
     * Proxy method for getBoundingClientRect().bottom. Returns the bottom position of
     * the first element in the set of matched elements. Position is relative to
     * the viewport.
     *
     * @public
     * @return {Number} The bottom position of the element.
     */

    DfDomElement.prototype.bottom = function() {
      var ref;
      return (ref = this.box()) != null ? ref.bottom : void 0;
    };


    /**
     * Proxy method for getBoundingClientRect().left. Returns the left position of
     * the first element in the set of matched elements. Position is relative to
     * the viewport.
     *
     * @public
     * @return {Number} The left position of the element.
     */

    DfDomElement.prototype.left = function() {
      var ref;
      return (ref = this.box()) != null ? ref.left : void 0;
    };


    /**
     * Gets scrolling position in the Y axis for the first element in the set of
     * matched elements. If a value is provided, it's set for all elements in the
     * set of matched elements.
     *
     * @public
     * @param  {Number} value Optional. Scroll position.
     * @return {Number}       Scroll position for get operation.
     */

    DfDomElement.prototype.scrollTop = function(value) {
      var ref;
      if (value != null) {
        return this.each(function(node) {
          if (Thing.is.window(node)) {
            return node.scrollTo(node.scrollX, value);
          } else {
            return node.scrollTop = value;
          }
        });
      } else {
        return (ref = this.box()) != null ? ref.scrollTop : void 0;
      }
    };


    /**
     * Gets scrolling position in the X axis for the first element in the set of
     * matched elements. If a value is provided, it's set for all elements in the
     * set of matched elements.
     *
     * @public
     * @param  {Number} value Optional. Scroll position.
     * @return {Number}       Scroll position for get operation.
     */

    DfDomElement.prototype.scrollLeft = function(value) {
      var ref;
      if (value != null) {
        return this.each(function(node) {
          if (Thing.is.window(node)) {
            return node.scrollTo(value, node.scrollY);
          } else {
            return node.scrollLeft = value;
          }
        });
      } else {
        return (ref = this.box()) != null ? ref.scrollLeft : void 0;
      }
    };


    /**
     * Sets scrolling at the specified coordinates for the set of matched
     * elements.
     *
     * @public
     * @param  {Number} x
     * @param  {Number} y
     */

    DfDomElement.prototype.scrollTo = function(x, y) {
      return this.each(function(node) {
        if (Thing.is.window(node)) {
          return node.scrollTo(x, y);
        } else {
          node.scrollLeft = x;
          return node.scrollTop = y;
        }
      });
    };

    DfDomElement.prototype.window = function() {
      return getWindow(this.get(0));
    };

    DfDomElement.prototype.document = function() {
      var node;
      node = this.get(0);
      if (node != null) {
        if (Thing.is.window(node)) {
          return node.document.documentElement;
        } else if (Thing.is.document(node)) {
          return node.documentElement;
        } else if (node.ownerDocument != null) {
          return node.ownerDocument.documentElement;
        }
      }
    };


    /**
     * Proxy method to Bean Framework's on(). Attachs an event handler to each
     * node in the set of matched elements.
     *
     * See: https://github.com/fat/bean#on
     *
     * @public
     */

    DfDomElement.prototype.on = function(eventName, selector, handler) {
      return this.each(function(node) {
        return bean.on(node, eventName, selector, handler);
      });
    };


    /**
     * Proxy method to Bean Framework's one(). Attachs a single-use event handler
     * to each node in the set of matched elements.
     *
     * See: https://github.com/fat/bean#one
     *
     * @public
     */

    DfDomElement.prototype.one = function(eventName, selector, handler) {
      return this.each(function(node) {
        return bean.one(node, eventName, selector, handler);
      });
    };


    /**
     * Proxy method to Bean Framework's fire(). Triggers the events provide on
     * each node in the set of matched elements.
     *
     * See: https://github.com/fat/bean#fire
     *
     * @public
     */

    DfDomElement.prototype.trigger = function(eventName, args) {
      if (eventName === 'focus' || eventName === 'blur') {
        return this[eventName]();
      } else {
        return this.each(function(node) {
          return bean.fire(node, eventName, args);
        });
      }
    };


    /**
     * Proxy method to Bean Framework's off(). Removes event handlers from each
     * node in the set of matched elements.
     *
     * See: https://github.com/fat/bean#off
     *
     * @public
     */

    DfDomElement.prototype.off = function(eventName, handler) {
      return this.each(function(node) {
        return bean.off(node, eventName, handler);
      });
    };


    /**
     * Due to the way focus works this shortcut makes easier triggering the event
     * from dfdom. The event is triggered only for the first node in the set of
     * matched elements.
     *
     * @public
     * @return {DfDomElement} Current instance.
     */

    DfDomElement.prototype.focus = function() {
      this.length && (this.get(0)).focus();
      return this;
    };


    /**
     * Due to the way blur works this shortcut makes easier triggering the event
     * from dfdom. The event is triggered only for the first node in the set of
     * matched elements.
     *
     * @public
     * @return {DfDomElement} Current instance.
     */

    DfDomElement.prototype.blur = function() {
      this.length && (this.get(0)).blur();
      return this;
    };


    /**
     * Checks the current matched set of elements against a selector or element,
     * and return true if all elements match the given argument.
     *
     * @public
     * @param  {String|Element} selector_or_element
     * @return {Boolean}
     */

    DfDomElement.prototype.is = function(selector_or_element) {
      if (Thing.is.string(selector_or_element)) {
        return (this.filter(selector_or_element)).length === this.length;
      } else {
        return (this.filter(function(node) {
          return node === selector_or_element;
        })).length === this.length;
      }
    };


    /**
     * Checks the current matched set of elements against a selector or element,
     * and return true if none of these elements matches the given argument.
     *
     * @public
     * @param  {String|Element} selector_or_element
     * @return {Boolean}
     */

    DfDomElement.prototype.isnt = function(selector_or_element) {
      return !this.is(selector_or_element);
    };


    /**
     * Checks if the first Element in the set of matched elements is the first child
     * of its container. Doesn't take into account Text nodes.
     * @return {Boolean} true if the node is the first child.
     */

    DfDomElement.prototype.isFirstElement = function() {
      return this.length && !(this.get(0)).previousElementSibling;
    };


    /**
     * Checks if the first Element in the set of matched elements is the last child
     * of its container. Doesn't take into account Text nodes.
     * @return {Boolean} true if the node is the last child.
     */

    DfDomElement.prototype.isLastElement = function() {
      return this.length && !(this.get(0)).nextElementSibling;
    };

    return DfDomElement;

  })();

  module.exports = function(selector) {
    switch (false) {
      case !(selector instanceof DfDomElement):
        return selector;
      default:
        return new DfDomElement(selector);
    }
  };

}).call(this);
