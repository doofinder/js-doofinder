bean = require "bean"
extend = require "extend"
Text = require "./text"
Thing = require "./thing"

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
    ].filter (funcName) -> Thing.is.fn node[funcName]).pop()
  node[MATCHES_SELECTOR_FN] selector

getWindow = (node) ->
  if Thing.is.window node
    view = node
  else if Thing.is.document node
    view = node.defaultView
  else if node.ownerDocument?
    view = node.ownerDocument.defaultView
  else
    view = null
  if view and view.opener then view else window

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
    Object.defineProperty @, 'length', get: -> @element.length

    if Thing.is.string selector
      selector = selector.toString().trim()
      if selector.length is 0
        selector = []
      else
        selector = (selector.split ",").map (s) -> s.trim()

    if Thing.is.array selector
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
    (Thing.is.element node) or
    (Thing.is.document node) or
    (Thing.is.window node)

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
    if selector instanceof NodeList
      @__fixNodeList selector
    else if Thing.is.string(selector) and selector.length > 0
      @__fixNodeList document.querySelectorAll @__fixSelector selector
    else if @__isValidElementNode selector
      [selector]
    else
      []

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

  get: (index) ->
    if index? then (@element[index] or null) else @element

  ###*
   * Reduces the set of matched elements to the first one from the set of
   * matched elements.
   *
   * @public
   * @return {DfDomElement}
  ###
  first: -> @item 0

  ###*
   * Reduces the set of matched elements to the last one from the set of
   * matched elements.
   *
   * @public
   * @return {DfDomElement}
  ###
  last: -> @item -1

  ###*
   * Reduces the set of matched elements to the one at the specified index.
   * Providing a negative number indicates a position starting from the end of
   * the set, rather than the beginning.
   *
   * @public
   * @param  {Number} index
   * @return {DfDomElement}
  ###
  item: (index) ->
    new DfDomElement (@element[if index >= 0 then index else @length + index] or [])

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
    if Thing.is.fn selector_or_fn
      filterFn = selector_or_fn
    else
      filterFn = (node) -> matchesSelector node, selector_or_fn
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
      src = if Thing.is.window node then window.document else node
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
   * Returns all the siblings of the elements in the set of matched elements
   * in a DfDomElement instance.
   *
   * @public
   * @return {DfDomElement}
  ###
  siblings: ->
    nodes = []
    @each (x) ->
      n = nodes.length
      args = ((new DfDomElement x).parent().children().filter (node) -> node isnt x).get()
      args.splice 0, 0, n, 0
      Array.prototype.splice.apply nodes, args
    new DfDomElement nodes

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
   * Clones an Element node or returns a copy of the same value if it's a
   * HTML string.
   *
   * @public
   * @param  {Element|String} node The node to be cloned.
   * @return {Element|String}      The copy or the same string.
  ###
  __cloneNode: (node) ->
    if Thing.is.string node
      node
    else if Thing.is.element node
      node.cloneNode true
    else
      throw "Invalid argument: #{node}"

  ###*
   * Prepends a node or HTML into the set of matched elements. If the child is a
   * Element then new copies are created when there're more than 1 item in
   * the set. If the child is a DfDomElement instance, all its matched elements
   * are "prepended" individually.
   *
   * @public
   * @param  {DfDomElement|Element|String} child Stuff to be prepended.
   * @return {DfDomElement}                      The current instance.
  ###
  prepend: (child) ->
    if child instanceof DfDomElement
      child = child.get()
    if Thing.is.array child
      child.forEach (node) => @prepend node
      return @
    else
      @each (node, i) =>
        if Thing.is.string child
          node.insertAdjacentHTML "afterbegin", child
        else if Thing.is.element child
          newChild = (if i is 0 then child else @__cloneNode child)
          if node.children.length > 0
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
    if Thing.is.array child
      child.forEach (node) => @append node
      return @
    else
      @each (node, i) =>
        if Thing.is.string child
          node.insertAdjacentHTML "beforeend", child
        else if Thing.is.element child
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
    if Thing.is.array sibling
      sibling.forEach (node) => @before node
      return @
    else
      @each (node, i) =>
        if Thing.is.string sibling
          node.insertAdjacentHTML "beforebegin", sibling
        else if Thing.is.element sibling
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
    if Thing.is.array sibling
      sibling.forEach (node) => @after node
      return @
    else
      @each (node, i) =>
        if Thing.is.string sibling
          node.insertAdjacentHTML  "afterend", sibling
        else if Thing.is.element sibling
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
    x = @length
    (@element.filter (node) -> node.classList.contains className).length is x

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
   * Note: the computed style of an element may not be the same as the value
   * specified in the style sheet and it depends on the browser's quirks.
   *
   * @public
   * @param  {String}         propertyName
   * @param  {String|Number}  value
   * @param  {String}         priority      The proper way to set !important
   * @return {DfDomElement|String|null} Current instance on set, value or null
   *                                    on get.
  ###
  css: (propertyName, value, priority) ->
    if value?
      propName = Text.dash2camel propertyName
      value = if priority? then "#{value}!#{priority}" else "#{value}"
      @each (node) ->
        node.style[propName] = value
    else if (node = @get 0)?
      propName = Text.camel2dash propertyName
      ((getWindow node).getComputedStyle node).getPropertyValue propName

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
  box: ->
    node = @get 0
    keys = ['left', 'top', 'right', 'bottom', 'width', 'height',
            'scrollLeft', 'scrollTop', 'scrollWidth', 'scrollHeight']

    # init rect with 0 value for all props
    rect = {}
    rect[k] = 0 for k in keys

    if node?
      if Thing.is.window node
        doc = @document()
        rect = extend rect,
          width:        node.outerWidth
          height:       node.outerHeight
          clientWidth:  node.innerWidth
          clientHeight: node.innerHeight
          scrollLeft:   node.scrollX
          scrollTop:    node.scrollY
          scrollWidth:  doc.scrollWidth
          scrollHeight: doc.scrollHeight
      else
        isDoc = Thing.is.document node
        isElm = node.getBoundingClientRect?

        if isDoc
          node = node.documentElement
          rect = extend rect,
            width:  node.offsetWidth
            height: node.offsetHeight

        if isElm
          box = node.getBoundingClientRect()
          rect[k] = box[k] for k in keys

        if isDoc or isElm
          rect = extend rect,
            clientWidth:  node.clientWidth
            clientHeight: node.clientHeight
            scrollLeft:   node.scrollLeft
            scrollTop:    node.scrollTop
            scrollWidth:  node.scrollWidth
            scrollHeight: node.scrollHeight
      rect

  # TODO: 2 new methods only with these measurements
  # bottomDistance = bottom
  # container.get(0).scrollHeight - container.get(0).scrollTop - container.get(0).clientHeight
  # container.get(0).scrollWidth - container.get(0).scrollLeft - container.get(0).clientWidth

  ###*
   * Proxy method for getBoundingClientRect().width. Returns the width of the
   * first element in the set of matched elements.
   *
   * @public
   * @return {Number} The width of the element.
  ###
  width: ->
    @box()?.width

  ###*
   * Proxy method for getBoundingClientRect().height. Returns the height of the
   * first element in the set of matched elements.
   *
   * @public
   * @return {Number} The height of the element.
  ###
  height: ->
    @box()?.height

  ###*
   * Proxy method for getBoundingClientRect().top. Returns the top position of
   * the first element in the set of matched elements. Position is relative to
   * the viewport.
   *
   * @public
   * @return {Number} The top position of the element.
  ###
  top: ->
    @box()?.top

  ###*
   * Proxy method for getBoundingClientRect().right. Returns the right position of
   * the first element in the set of matched elements. Position is relative to
   * the viewport.
   *
   * @public
   * @return {Number} The right position of the element.
  ###
  right: ->
    @box()?.right

  ###*
   * Proxy method for getBoundingClientRect().bottom. Returns the bottom position of
   * the first element in the set of matched elements. Position is relative to
   * the viewport.
   *
   * @public
   * @return {Number} The bottom position of the element.
  ###
  bottom: ->
    @box()?.bottom

  ###*
   * Proxy method for getBoundingClientRect().left. Returns the left position of
   * the first element in the set of matched elements. Position is relative to
   * the viewport.
   *
   * @public
   * @return {Number} The left position of the element.
  ###
  left: ->
    @box()?.left

  ###*
   * Gets scrolling position in the Y axis for the first element in the set of
   * matched elements. If a value is provided, it's set for all elements in the
   * set of matched elements.
   *
   * @public
   * @param  {Number} value Optional. Scroll position.
   * @return {Number}       Scroll position for get operation.
  ###
  scrollTop: (value) ->
    if value?
      @each (node) ->
        if Thing.is.window node
          node.scrollTo node.scrollX, value
        else
          node.scrollTop = value
    else
      @box()?.scrollTop

  ###*
   * Gets scrolling position in the X axis for the first element in the set of
   * matched elements. If a value is provided, it's set for all elements in the
   * set of matched elements.
   *
   * @public
   * @param  {Number} value Optional. Scroll position.
   * @return {Number}       Scroll position for get operation.
  ###
  scrollLeft: (value) ->
    if value?
      @each (node) ->
        if Thing.is.window node
          node.scrollTo value, node.scrollY
        else
          node.scrollLeft = value
    else
      @box()?.scrollLeft

  ###*
   * Sets scrolling at the specified coordinates for the set of matched
   * elements.
   *
   * @public
   * @param  {Number} x
   * @param  {Number} y
  ###
  scrollTo: (x, y) ->
    @each (node) ->
      if Thing.is.window node
        node.scrollTo x, y
      else
        node.scrollLeft = x
        node.scrollTop = y

  window: ->
    getWindow @get 0

  document: ->
    node = @get 0
    if node?
      if Thing.is.window node
        node.document.documentElement
      else if Thing.is.document node
        node.documentElement
      else if node.ownerDocument?
        node.ownerDocument.documentElement

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
  on: (eventName, selector, handler) ->
    @each (node) -> bean.on node, eventName, selector, handler

  ###*
   * Proxy method to Bean Framework's one(). Attachs a single-use event handler
   * to each node in the set of matched elements.
   *
   * See: https://github.com/fat/bean#one
   *
   * @public
  ###
  one: (eventName, selector, handler) ->
    @each (node) -> bean.one node, eventName, selector, handler

  ###*
   * Proxy method to Bean Framework's fire(). Triggers the events provide on
   * each node in the set of matched elements.
   *
   * See: https://github.com/fat/bean#fire
   *
   * @public
  ###
  trigger: (eventName, args) ->
    if eventName in ['focus', 'blur']
      @[eventName]()
    else
      @each (node) -> bean.fire node, eventName, args

  ###*
   * Proxy method to Bean Framework's off(). Removes event handlers from each
   * node in the set of matched elements.
   *
   * See: https://github.com/fat/bean#off
   *
   * @public
  ###
  off: (eventName, handler) ->
    @each (node) -> bean.off node, eventName, handler

  ###*
   * Due to the way focus works this shortcut makes easier triggering the event
   * from dfdom. The event is triggered only for the first node in the set of
   * matched elements.
   *
   * @public
   * @return {DfDomElement} Current instance.
  ###
  focus: ->
    @length and (@get 0).focus()
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
    @length and (@get 0).blur()
    return @

  #
  # Tools
  #

  ###*
   * Checks the current matched set of elements against a selector or element,
   * and return true if all elements match the given argument.
   *
   * @public
   * @param  {String|Element} selector_or_element
   * @return {Boolean}
  ###
  is: (selector_or_element) ->
    if Thing.is.string selector_or_element
      (@filter selector_or_element).length == @length
    else
      (@filter (node) -> node is selector_or_element).length == @length

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
   * Checks if the first Element in the set of matched elements is the first child
   * of its container. Doesn't take into account Text nodes.
   * @return {Boolean} true if the node is the first child.
  ###
  isFirstElement: ->
    @length and not (@get 0).previousElementSibling

  ###*
   * Checks if the first Element in the set of matched elements is the last child
   * of its container. Doesn't take into account Text nodes.
   * @return {Boolean} true if the node is the last child.
  ###
  isLastElement: ->
    @length and not (@get 0).nextElementSibling


module.exports = (selector) ->
  switch
    when selector instanceof DfDomElement then selector
    else new DfDomElement selector
