bean = require "bean"

MATCHES_SELECTOR_FN = null

matchesSelector = (node, selector) ->
  unless MATCHES_SELECTOR_FN?
    MATCHES_SELECTOR_FN = ([
      'matches',
      'webkitMatchesSelector',
      'mozMatchesSelector',
      'msMatchesSelector',
      'oMatchesSelector',
      'matchesSelector'
    ].filter (funcName) -> typeof node[funcName] is 'function').pop()
  node[MATCHES_SELECTOR_FN] selector


###*
 * DfDomElement
 * This class manages a set of DOM elements identified by a selector.
###
class DfDomElement
  ###*
   * @public
   * @param  {String|Element|NodeList|Array} selector
   * @return {DfDomElement}
  ###
  constructor: (selector) ->
    Object.defineProperty this, 'length', get: -> @element.length

    if selector instanceof String
      selector = selector.toString()

    if typeof selector is "string"
      selector = selector.trim()
      if selector.length is 0
        selector = []
      else
        selector = (selector.split ",").map (s) -> s.trim()

    if selector instanceof Array
      @element = @__initFromSelectorArray selector
    else
      @element = @__initFromSelector selector

    @__uniquify()

  ###*
   * Fixes the provided selector by:
   *
   * - Removing blanks.
   * - Changing the selection query for IDs starting by a number.
   *
   * @protected
   * @param  {String} selector A CSS selector.
   * @return {String}
  ###
  __fixSelector: (selector) ->
    selector = selector.trim()
    switch
      when /^#\d/.test selector then "[id=\"#{selector.substring 1}\"]"
      else selector

  ###*
   * Converts a NodeList to an Array.
   * @protected
   * @param  {NodeList} nodeList A NodeList instance.
   * @return {Array}             An Array with the same nodes as the NodeList.
  ###
  __fixNodeList: (nodeList) ->
    Array.prototype.slice.call nodeList

  ###*
   * Returns true if a DfDomElement instance can be created for the provided
   * node.
   *
   * @protected
   * @param  {HTMLElement|HTMLBodyElement|HTMLDocument|Document|Window} node
   * @return {Boolean}
  ###
  __isValidElementNode: (node) ->
    return false unless node?
    switch
      # HTML Element
      when typeof HTMLElement isnt 'undefined' and
           node instanceof HTMLElement and
           node.nodeType is 1 then true
      # The Window
      when typeof node is 'object' and 'setInterval' of node then true
      # The Document
      when typeof node.documentElement is 'object' then true
      else false

  ###*
   * Fills the internal store from an array of selectors.
   * @protected
   * @param  {Array} arr An Array of selectors (of all valid types)
   * @return {Array}     An Array of nodes.
  ###
  __initFromSelectorArray: (arr) ->
    element = []
    arr.forEach (selector) =>
      element = element.concat @__initFromSelector selector
    element

  ###*
   * Fills the internal store from a selector.
   * @protected
   * @param  {String|Element|NodeList|Array} selector
   * @return {Array}     An Array of nodes.
  ###
  __initFromSelector: (selector) ->
    if typeof selector is "string" and selector.length > 0
      element = @__fixNodeList document.querySelectorAll @__fixSelector selector
    else if @__isValidElementNode selector
      element = [selector]
    else if selector instanceof NodeList
      element = @__fixNodeList selector
    else
      element = []
    element

  ###*
   * Removes duplicates from the internal store.
   * @protected
   * @return {DfDomElement} The current instance.
  ###
  __uniquify: ->
    nodes = while @element.length > 0
      candidate = (@element.splice 0, 1).pop()
      @element = @element.filter (node) -> node != candidate
      candidate
    @element = nodes
    return @

  #
  # NODE HIERARCHY MANAGEMENT
  #

  ###*
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
  ###
  __find: (finder) ->
    results = []
    @each (rootNode) ->
      start = (Math.max results.length - 1, 0)
      args = [start, 0].concat (finder rootNode)
      Array.prototype.splice.apply results, args
    results

  get: (key) ->
    if key? then @element[key] or null else @element

  first: ->
    new DfDomElement @get 0

  ###*
   * Iterates nodes in the set of matched elements, passing them to the
   * callback.
   *
   * @public
   * @param  {Function} callback
   * @return {DfDomElement}
  ###
  each: (callback) ->
    @element.forEach callback, @
    return @

  ###*
   * Reduce the set of matched elements to those for which the function doesn't
   * return null or undefined.
   *
   * @public
   * @param  {Function} callback
   * @return {DfDomElement}
  ###
  map: (callback) ->
    new DfDomElement ((@element.map callback, @).filter (node) -> node?)

  ###*
   * Reduce the set of matched elements to those match the selector or pass the
   * function's test.
   *
   * @public
   * @param  {Function|String} callback Function
   * @return {DfDomElement}
  ###
  filter: (selector_or_fn) ->
    if typeof selector_or_fn is "string"
      filterFn = (node) -> matchesSelector node, selector_or_fn
    else
      filterFn = selector_or_fn
    new DfDomElement (@element.filter filterFn, @)

  ###*
   * Finds nodes that match the passed selector starting from each element in
   * the store.
   *
   * @public
   * @param  {String} selector CSS Selector.
   * @return {DfDomElement}
  ###
  find: (selector) ->
    finderFn = (node) =>
      src = if node is window then window.document else node
      @__fixNodeList src.querySelectorAll selector
    new DfDomElement @__find finderFn

  ###*
   * Returns all the children of the elements in the set of matched elements in a DfDomElement
   * instance.
   *
   * @public
   * @return {DfDomElement}
  ###
  children: ->
    finderFn = (node) =>
      @__fixNodeList node.children
    new DfDomElement @__find finderFn

  ###*
   * Returns a DfDomElement instance that contains the parent node of all the
   * elements in the current store. Duplicates are removed.
   *
   * @public
   * @return {DfDomElement}
  ###
  parent: ->
    new DfDomElement (@element.map ((node) -> node.parentElement), @)

  ###*
   * Returns a DfDomElement instance that contains all the parents of all the
   * elements in the set of matched elements. Can be limited to nodes that match
   * the provided selector. Duplicates are removed.
   *
   * @public
   * @param  {String} selector Optional CSS Selector.
   * @return {DfDomElement}
  ###
  parents: (selector) ->
    finder = (item) =>
      results = []
      while item.parentElement
        if not selector? or matchesSelector item.parentElement, selector
          results.push item.parentElement
        item = item.parentElement
      results
    new DfDomElement @__find finder

  ###*
   * Returns a DfDomElement instance that contains the closest parent of all
   * the elements in the set of matched elements. If a selector is provided,
   * nodes must match the selector to be selected.
   *
   * @public
   * @param  {String} selector Optional CSS Selector.
   * @return {DfDomElement}
  ###
  closest: (selector) ->
    mapperFn = (node) ->
      ((new DfDomElement node).parents selector).get 0
    new DfDomElement (@element.map mapperFn, @)

  #
  # Content retrieving and injection
  #

  ###*
   * Sets the HTML contents of each element in the set of matched elements. If
   * called with no arguments retrieves the HTML of the first element in the set
   * of matched elements.
   *
   * @public
   * @param  {String} htmlContent   HTML source code to insert. Optional.
   * @return {DfDomElement|String}  The same instance if is a set operation.
   *                                The HTML source code if is get operation.
  ###
  html: (htmlContent) ->
    if htmlContent?
      @each (node) -> node.innerHTML = htmlContent
    else
      (@get 0).innerHTML

  ###*
   * Clones an Element node or returns the same if it's a HTML string.
   * @public
   * @param  {Element|String} node The node to be cloned.
   * @return {Element|String}      The copy or the same string.
  ###
  __cloneNode: (node) ->
    switch
      when typeof node is "string" then node
      when node instanceof Element then node.cloneNode true
      else throw "Invalid argument: #{node}"

  ###*
   * Prepends a node or HTML into the set of matched elements. If the child is a
   * Element then new copies are created when there're more than 1 item in
   * the set. If the child is a DfDomElement instance, all its matched elements
   * are "prepended" individually.
   *
   * @public
   * @param  {DfDomElement|Element|String} child Stuff to be prepended.
   * @return {DfDomElement}                          The current instance.
  ###
  prepend: (child) ->
    if child instanceof DfDomElement
      child = child.get()
    if child instanceof Array
      child.forEach (node) => @prepend node
      return @
    else
      @each (node, i) =>
        if typeof child is "string"
          node.insertAdjacentHTML "afterbegin", child
        else if child instanceof Element
          newChild = (if i is 0 then child else @__cloneNode child)
          if node.children?.length > 0
            node.insertBefore newChild, node.children[0]
          else
            node.appendChild newChild

  ###*
   * Appends a node or HTML into the set of matched elements. If the child is a
   * Element then new copies are created when there're more than 1 item in
   * the set. If the child is a DfDomElement instance, all its matched elements
   * are appended individually.
   *
   * @public
   * @param  {DfDomElement|Element|String} child Stuff to be appended.
   * @return {DfDomElement}                          The current instance.
  ###
  append: (child) ->
    if child instanceof DfDomElement
      child = child.get()
    if child instanceof Array
      child.forEach (node) => @append node
      return @
    else
      @each (node, i) =>
        if typeof child is "string"
          node.insertAdjacentHTML "beforeend", child
        else if child instanceof Element
          node.appendChild (if i is 0 then child else @__cloneNode child)

  ###*
   * Inserts a node or HTML before the set of matched elements. If the node is
   * an Element then new copies are created when there're more than 1 item in
   * the set. If the node is a DfDomElement instance, all its matched elements
   * are inserted before the current set.
   *
   * @public
   * @param  {DfDomElement|Element|String} child Stuff to be inserted.
   * @return {DfDomElement}                          The current instance.
  ###
  before: (sibling) ->
    if sibling instanceof DfDomElement
      sibling = sibling.get()
    if sibling instanceof Array
      sibling.forEach (node) => @before node
      return @
    else
      @each (node, i) =>
        if typeof sibling is "string"
          node.insertAdjacentHTML  "beforebegin", sibling
        else if sibling instanceof Element
          newSibling = (if i is 0 then sibling else @__cloneNode sibling)
          node.parentElement.insertBefore newSibling, node

  ###*
   * Inserts a node or HTML after the set of matched elements. If the node is
   * an Element then new copies are created when there're more than 1 item in
   * the set. If the node is a DfDomElement instance, all its matched elements
   * are inserted before the current set.
   *
   * @public
   * @param  {DfDomElement|Element|String} child Stuff to be inserted.
   * @return {DfDomElement}                          The current instance.
  ###
  after: (sibling) ->
    if sibling instanceof DfDomElement
      sibling = sibling.get()
    if sibling instanceof Array
      sibling.forEach (node) => @after node
      return @
    else
      @each (node, i) =>
        if typeof sibling is "string"
          node.insertAdjacentHTML  "afterend", sibling
        else if sibling instanceof Element
          newSibling = (if i is 0 then sibling else @__cloneNode sibling)
          node.parentElement.insertBefore newSibling, node.nextSibling

  ###*
   * Empties the nodes in the set of matched elements so there's no HTML inside.
   * @public
   * @return {DfDomElement} Current instance.
  ###
  empty: ->
    @html ""

  ###*
   * Removes the nodes in the set of matched elements.
   * @public
   * @return {DfDomElement} Current instance.
  ###
  remove: ->
    @each (node) -> node.parentNode?.removeChild node

  #
  # Tag Attributes, Classes, Values
  #

  ###*
   * Get the value of an attribute for the first element in the set of matched
   * elements or set one or more attributes for every matched element.
   *
   * @public
   * @param  {String} name              Attribute name.
   * @param  {String} value             Attribute value.
   * @return {DfDomElement|String|null} Current instance on set, attribute
   *                                    value on get.
  ###
  attr: (name, value) ->
    if value?
      @each (node) -> node.setAttribute name, value
    else
      (@get 0)?.getAttribute name

  ###*
   * Removes an attribute from the set of matched elements.
   * @public
   * @param  {String} name          Attribute name.
   * @return {DfDomElement|String}  Current instance.
  ###
  removeAttr: (name) ->
    @each (node) -> node.removeAttribute name

  ###*
   * Checks whether all the elements in the set of matched elements have certain
   * attribute or not.
   *
   * @public
   * @param  {String} name  Attribute name.
   * @return {Boolean}      true if the attribute is present.
  ###
  hasAttr: (name) ->
    (@element.filter (node) -> node.hasAttribute name).length > 0

  ###*
   * Shortcut to get or set data-* attributes' values for the set of matched
   * elements. When getting the value returns the value of the first element
   * in the set.
   *
   * @public
   * @param  {String} name              Attribute name.
   * @param  {String} value             Attribute value.
   * @return {DfDomElement|String|null} Current instance on set,
   *                                    data-attribute value on get.
  ###
  data: (name, value) ->
    @attr "data-#{name}", value

  ###*
   * Sets the value of the elements in the set of matched elements whose
   * prototype has `value` defined as a valid property. When no value is
   * provided, returns the value of the first element in the set, if it
   * supports it. Otherwise, returns undefined.
   *
   * @public
   * @param  {*} value Optional. The value that must be set for each element.
   * @return {*}       The value of the first element in the set, if supports
   *                   it.
  ###
  val: (value) ->
    if value?
      @each (node) ->
        node.value = value if node.value?
    else if (node = @get 0)?.value?
      node.value
    else
      undefined

  ###*
   * Adds a class name to all the elements in the set of matched elements.
   * @public
   * @param {String} className
  ###
  addClass: (className) ->
    @each (node) -> node.classList.add className

  ###*
   * Checks whether all elements in the set of matched elements have a certain
   * class name.
   *
   * @public
   * @param {String} className
  ###
  hasClass: (className) ->
    (@element.filter (node) -> node.classList.contains className).length > 0

  ###*
   * Removes a class name from all the elements in the set of matched elements.
   * @public
   * @param {String} className
  ###
  removeClass: (className) ->
    @each (node) -> node.classList.remove className

  ###*
   * Toggles the presence of certain class name for the elements in the set of
   * matched elements.
   *
   * @public
   * @param {String} className
  ###
  toggleClass: (className) ->
    @each (node) -> node.classList.toggle className

  #
  # Styles
  #

  ###*
   * Gets the value of a computed style property for the first element in the
   * set of matched elements or set one or more CSS properties for every matched
   * element.
   *
   * @public
   * @param  {String}         propertyName
   * @param  {String|Number}  value
   * @return {DfDomElement|String|null} Current instance on set, value or null
   *                                    on get.
  ###
  css: (propertyName, value) ->
    if value?
      @each (node) -> node.style[propertyName] = value
    else if (node = @get 0)?
      (getComputedStyle node).getPropertyValue propertyName
    else
      null

  ###*
   * Hides the element in the set of matched elements by setting their display
   * property to "none".
   *
   * @public
   * @return {DfDomElement} Current instance.
  ###
  hide: ->
    @css "display", "none"

  ###*
   * Displays the elements in the set of matched elements by unsetting their
   * display property.
   *
   * @public
   * @return {DfDomElement} Current instance.
  ###
  show: ->
    @each (node) -> node.style.removeProperty "display"

  #
  # Measurement
  #

  ###*
   * Returns the size of the first element in the set of matched elements and
   * its position relative to the viewport.
   *
   * @protected
   * @return {DOMRect} The returned value is a DOMRect object, which contains
   *                   read-only left, top, right, bottom, x, y, width, height
   *                   properties describing the border-box in pixels. # MDN #
  ###
  __clientRect: ->
    (@get 0)?.getBoundingClientRect?()

  ###*
   * Proxy method for getBoundingClientRect().width. Returns the width of the
   * first element in the set of matched elements.
   *
   * @public
   * @return {Number} The width of the element.
  ###
  width: ->
    @__clientRect()?.width

  ###*
   * Proxy method for getBoundingClientRect().height. Returns the height of the
   * first element in the set of matched elements.
   *
   * @public
   * @return {Number} The height of the element.
  ###
  height: ->
    @__clientRect()?.height

  ###*
   * Proxy method for getBoundingClientRect().top. Returns the top position of
   * the first element in the set of matched elements. Position is relative to
   * the viewport.
   *
   * @public
   * @return {Number} The top position of the element.
  ###
  top: ->
    @__clientRect()?.top

  ###*
   * Proxy method for getBoundingClientRect().right. Returns the right position of
   * the first element in the set of matched elements. Position is relative to
   * the viewport.
   *
   * @public
   * @return {Number} The right position of the element.
  ###
  right: ->
    @__clientRect()?.right

  ###*
   * Proxy method for getBoundingClientRect().bottom. Returns the bottom position of
   * the first element in the set of matched elements. Position is relative to
   * the viewport.
   *
   * @public
   * @return {Number} The bottom position of the element.
  ###
  bottom: ->
    @__clientRect()?.bottom

  ###*
   * Proxy method for getBoundingClientRect().left. Returns the left position of
   * the first element in the set of matched elements. Position is relative to
   * the viewport.
   *
   * @public
   * @return {Number} The left position of the element.
  ###
  left: ->
    @__clientRect()?.left

  __scrollProperty: (node, propertyName, value) ->
    if value?
      node[propertyName] = value
      new DfDomElement node
    else
      node[propertyName]

  scrollTop: (value) ->
    node = @get 0
    if node?
      propertyName = if node.scrollY? then "scrollY" else "scrollTop"
      @__scrollProperty node, propertyName, value


  scrollLeft: (value) ->
    node = @get 0
    if node?
      propertyName = if node.scrollX? then "scrollX" else "scrollLeft"
      @__scrollProperty node, propertyName, value

  #
  # Events
  #

  ###*
   * Proxy method to Bean Framework's on(). Attachs an event handler to each
   * node in the set of matched elements.
   *
   * See: https://github.com/fat/bean#on
   *
   * @public
  ###
  on: (events, selector, fn, args) ->
    @each (node) -> bean.on node, events, selector, fn, args

  ###*
   * Proxy method to Bean Framework's one(). Attachs a single-use event handler
   * to each node in the set of matched elements.
   *
   * See: https://github.com/fat/bean#one
   *
   * @public
  ###
  one: (events, selector, fn, args) ->
    @each (node) -> bean.one node, events, selector, fn, args

  ###*
   * Proxy method to Bean Framework's fire(). Triggers the events provide on
   * each node in the set of matched elements.
   *
   * See: https://github.com/fat/bean#fire
   *
   * @public
  ###
  trigger: (events, args) ->
    @each (node) -> bean.fire node, events, args

  ###*
   * Proxy method to Bean Framework's off(). Removes event handlers from each
   * node in the set of matched elements.
   *
   * See: https://github.com/fat/bean#off
   *
   * @public
  ###
  off: (events, fn) ->
    @each (node) -> bean.off node, events, fn

  ###*
   * Due to the way focus works this shortcut makes easier triggering the event
   * from dfdom. The event is triggered only for the first node in the set of
   * matched elements.
   *
   * @public
   * @return {DfDomElement} Current instance.
  ###
  focus: ->
    (@get 0)?.focus()
    return @

  ###*
   * Due to the way blur works this shortcut makes easier triggering the event
   * from dfdom. The event is triggered only for the first node in the set of
   * matched elements.
   *
   * @public
   * @return {DfDomElement} Current instance.
  ###
  blur: ->
    (@get 0)?.blur()
    return @

  #
  # Tools
  #

  ###*
   * Checks the current matched set of elements against a selector or element,
   * and return true if at least one of these elements matches the given
   * argument.
   *
   * @public
   * @param  {String|Element} selector_or_element
   * @return {Boolean}
  ###
  is: (selector_or_element) ->
    if typeof selector_or_element is "string"
      (@filter selector_or_element).length > 0
    else
      (@filter (node) -> node is selector_or_element).length > 0

  ###*
   * Checks the current matched set of elements against a selector or element,
   * and return true if none of these elements matches the given argument.
   *
   * @public
   * @param  {String|Element} selector_or_element
   * @return {Boolean}
  ###
  isnt: (selector_or_element) ->
    not @is selector_or_element

  ###*
   * Reduces the set of matched elements to the one at the specified index.
   * Providing a negative number indicates a position starting from the end of
   * the set, rather than the beginning.
   *
   * @public
   * @param  {Number} index
   * @return {DfDomElement}
  ###
  eq: (index) ->
    new DfDomElement (@element[if index >= 0 then index else @length + index] or [])


module.exports = (selector) ->
  switch
    when selector instanceof DfDomElement then selector
    else new DfDomElement selector
