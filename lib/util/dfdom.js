(function() {
  var DfDomElement, MATCHES_SELECTOR_FN, bean, matchesSelectorFn;

  bean = require("bean");

  MATCHES_SELECTOR_FN = null;

  matchesSelectorFn = function() {
    var testNode;
    if (MATCHES_SELECTOR_FN == null) {
      testNode = document.querySelector('html, body, head');
      MATCHES_SELECTOR_FN = (['matches', 'webkitMatchesSelector', 'mozMatchesSelector', 'msMatchesSelector', 'oMatchesSelector', 'matchesSelector'].filter(function(funcName) {
        return typeof testNode[funcName] === 'function';
      })).pop();
    }
    return MATCHES_SELECTOR_FN;
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
      if (selector instanceof String) {
        selector = selector.toString();
      }
      if (typeof selector === "string") {
        selector = selector.trim();
        if (selector.length === 0) {
          selector = [];
        } else {
          selector = (selector.split(",")).map(function(s) {
            return s.trim();
          });
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
     * @param  {Element|HTMLDocument|Document|Window} node
     * @return {Boolean}
     */

    DfDomElement.prototype.__isValidElementNode = function(node) {
      switch (false) {
        case !(node instanceof Element):
          return true;
        case !(node instanceof Document):
          return true;
        case !(node instanceof Window):
          return true;
        default:
          return false;
      }
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
      var element;
      if (typeof selector === "string" && selector.length > 0) {
        element = this.__fixNodeList(document.querySelectorAll(this.__fixSelector(selector)));
      } else if (this.__isValidElementNode(selector)) {
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

    DfDomElement.prototype.get = function(key) {
      if (key != null) {
        return this.element[key] || null;
      } else {
        return this.element;
      }
    };

    DfDomElement.prototype.first = function() {
      return new DfDomElement(this.get(0));
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
      return new DfDomElement((this.element.map(callback, this)).filter(function(node) {
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
      if (typeof selector_or_fn === "string") {
        filterFn = function(node) {
          return node[matchesSelectorFn()](selector_or_fn);
        };
      } else {
        filterFn = selector_or_fn;
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
          src = node === window ? window.document : node;
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
            if ((selector == null) || item.parentElement[matchesSelectorFn()](selector)) {
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
     * Clones an Element node or returns the same if it's a HTML string.
     * @public
     * @param  {Element|String} node The node to be cloned.
     * @return {Element|String}      The copy or the same string.
     */

    DfDomElement.prototype.__cloneNode = function(node) {
      switch (false) {
        case typeof node !== "string":
          return node;
        case !(node instanceof Element):
          return node.cloneNode(true);
        default:
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
     * @return {DfDomElement}                          The current instance.
     */

    DfDomElement.prototype.prepend = function(child) {
      if (child instanceof DfDomElement) {
        child = child.get();
      }
      if (child instanceof Array) {
        child.forEach((function(_this) {
          return function(node) {
            return _this.prepend(node);
          };
        })(this));
        return this;
      } else {
        return this.each((function(_this) {
          return function(node, i) {
            var newChild, ref;
            if (typeof child === "string") {
              return node.insertAdjacentHTML("afterbegin", child);
            } else if (child instanceof Element) {
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
      if (child instanceof Array) {
        child.forEach((function(_this) {
          return function(node) {
            return _this.append(node);
          };
        })(this));
        return this;
      } else {
        return this.each((function(_this) {
          return function(node, i) {
            if (typeof child === "string") {
              return node.insertAdjacentHTML("beforeend", child);
            } else if (child instanceof Element) {
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
      if (sibling instanceof Array) {
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
            if (typeof sibling === "string") {
              return node.insertAdjacentHTML("beforebegin", sibling);
            } else if (sibling instanceof Element) {
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
      if (sibling instanceof Array) {
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
            if (typeof sibling === "string") {
              return node.insertAdjacentHTML("afterend", sibling);
            } else if (sibling instanceof Element) {
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
      return (this.element.filter(function(node) {
        return node.classList.contains(className);
      })).length > 0;
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
     * @public
     * @param  {String}         propertyName
     * @param  {String|Number}  value
     * @return {DfDomElement|String|null} Current instance on set, value or null
     *                                    on get.
     */

    DfDomElement.prototype.css = function(propertyName, value) {
      var node;
      if (value != null) {
        return this.each(function(node) {
          return node.style[propertyName] = value;
        });
      } else if ((node = this.get(0)) != null) {
        return (getComputedStyle(node)).getPropertyValue(propertyName);
      } else {
        return null;
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

    DfDomElement.prototype.__clientRect = function() {
      var ref;
      return (ref = this.get(0)) != null ? typeof ref.getBoundingClientRect === "function" ? ref.getBoundingClientRect() : void 0 : void 0;
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
      return (ref = this.__clientRect()) != null ? ref.width : void 0;
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
      return (ref = this.__clientRect()) != null ? ref.height : void 0;
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
      return (ref = this.__clientRect()) != null ? ref.top : void 0;
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
      return (ref = this.__clientRect()) != null ? ref.right : void 0;
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
      return (ref = this.__clientRect()) != null ? ref.bottom : void 0;
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
      return (ref = this.__clientRect()) != null ? ref.left : void 0;
    };

    DfDomElement.prototype.__scrollProperty = function(node, propertyName, value) {
      if (value != null) {
        node[propertyName] = value;
        return new DfDomElement(node);
      } else {
        return node[propertyName];
      }
    };

    DfDomElement.prototype.scrollTop = function(value) {
      var node, propertyName;
      node = this.get(0);
      if (node != null) {
        propertyName = node.scrollY != null ? "scrollY" : "scrollTop";
        return this.__scrollProperty(node, propertyName, value);
      }
    };

    DfDomElement.prototype.scrollLeft = function(value) {
      var node, propertyName;
      node = this.get(0);
      if (node != null) {
        propertyName = node.scrollX != null ? "scrollX" : "scrollLeft";
        return this.__scrollProperty(node, propertyName, value);
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

    DfDomElement.prototype.on = function(events, selector, fn, args) {
      return this.each(function(node) {
        return bean.on(node, events, selector, fn, args);
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

    DfDomElement.prototype.one = function(events, selector, fn, args) {
      return this.each(function(node) {
        return bean.one(node, events, selector, fn, args);
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

    DfDomElement.prototype.trigger = function(events, args) {
      return this.each(function(node) {
        return bean.fire(node, events, args);
      });
    };


    /**
     * Proxy method to Bean Framework's off(). Removes event handlers from each
     * node in the set of matched elements.
     *
     * See: https://github.com/fat/bean#off
     *
     * @public
     */

    DfDomElement.prototype.off = function(events, fn) {
      return this.each(function(node) {
        return bean.off(node, events, fn);
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
      var ref;
      if ((ref = this.get(0)) != null) {
        ref.focus();
      }
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
      var ref;
      if ((ref = this.get(0)) != null) {
        ref.blur();
      }
      return this;
    };


    /**
     * Checks the current matched set of elements against a selector or element,
     * and return true if at least one of these elements matches the given
     * argument.
     *
     * @public
     * @param  {String|Element} selector_or_element
     * @return {Boolean}
     */

    DfDomElement.prototype.is = function(selector_or_element) {
      if (typeof selector_or_element === "string") {
        return (this.filter(selector_or_element)).length > 0;
      } else {
        return (this.filter(function(node) {
          return node === selector_or_element;
        })).length > 0;
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
     * Reduces the set of matched elements to the one at the specified index.
     * Providing a negative number indicates a position starting from the end of
     * the set, rather than the beginning.
     *
     * @public
     * @param  {Number} index
     * @return {DfDomElement}
     */

    DfDomElement.prototype.eq = function(index) {
      return new DfDomElement(this.element[index >= 0 ? index : this.length + index] || []);
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
