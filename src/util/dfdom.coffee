bean = require "bean"

MATCHES_SELECTOR_FN = ([
  'matches',
  'webkitMatchesSelector',
  'mozMatchesSelector',
  'msMatchesSelector',
  'oMatchesSelector',
  'matchesSelector'
].filter (funcName) -> typeof document.body[funcName] is 'function').pop()

###*
 * DfDomElement
 * This class manages a set of DOM elements identified by a selector.
###
class DfDomElement
  ###*
   * @public
   * @param  {string|String|HTMLElement|NodeList|Array} selector
   * @return {DfDomElement}
  ###
  constructor: (selector) ->
    Object.defineProperty this, 'len', get: -> @element.length

    if selector instanceof String
      selector = selector.toString()
    if typeof selector is "string"
      selector = selector.split ","
      selector = selector[0] if selector.length == 0
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
   * @param  {string} selector A CSS selector.
   * @return {string}
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
   * @param  {string|HTMLElement|NodeList|Array} selector
   * @return {Array}     An Array of nodes.
  ###
  __initFromSelector: (selector) ->
    if typeof selector is "string"
      element = @__fixNodeList document.querySelectorAll @__fixSelector selector
    else if selector instanceof HTMLElement
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
   * Iterates over nodes in the store, passing them to the callback.
   * @public
   * @param  {Function} callback
   * @return {undefined}
  ###
  each: (callback) ->
    @element.forEach callback
    return @

  ###*
   * Iterates over nodes in the store, passing them to the callback, and stores
   * the result of the callback in an array.
   *
   * TODO: THIS SHOULD BE INTERNAL, CREATE A MAP FUNCTION THAT RETURNS A DfDomElement INSTANCE
   *
   * @public
   * @param  {Function} callback
   * @return {Array}
  ###
  map: (callback) ->
    @element.map callback

  # TODO: CREATE A FILTER METHOD THAT RETURNS A FILTERED DfDomElement INSTANCE

  ###*
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
  ###
  __find: (finder) ->
    results = []
    @each (rootNode) ->
      start = (Math.max results.length - 1, 0)
      args = [start, 0].concat (finder rootNode)
      Array.prototype.splice.apply results, args
    results

  ###*
   * Finds nodes that match the passed selector starting from each element in
   * the store.
   *
   * @public
   * @param  {string} selector CSS Selector.
   * @return {DfDomElement}
  ###
  find: (selector) ->
    new DfDomElement @__find (item) => @__fixNodeList item.querySelectorAll selector

  ###*
   * Returns all the children of the elements in the store in a DfDomElement
   * instance.
   *
   * @public
   * @return {DfDomElement}
  ###
  children: ->
    new DfDomElement @__find (item) => @__fixNodeList item.children

  ###*
   * Returns a DfDomElement instance that contains the parent node of all the
   * elements in the current store. Duplicates are removed.
   *
   * @public
   * @return {DfDomElement}
  ###
  parent: ->
    new DfDomElement @map (item) -> item.parentElement

  ###*
   * Returns a DfDomElement instance that contains all the parents of all the
   * elements in the store. Can be limited to nodes that match the provided
   * selector. Duplicates are removed.
   *
   * @public
   * @param  {string} selector Optional CSS Selector.
   * @return {DfDomElement}
  ###
  parents: (selector) ->
    finder = (item) =>
      results = []
      while item.parentElement
        if not selector? or item.parentElement[MATCHES_SELECTOR_FN] selector
          results.push item.parentElement
        item = item.parentElement
      results
    new DfDomElement @__find finder

  ###*
   * Returns a DfDomElement instance that contains the closest parent of all
   * the elements in the store. If a selector is provided, nodes must match
   * the selector to be selected.
   *
   * @public
   * @param  {string} selector Optional CSS Selector.
   * @return {DfDomElement}
  ###
  closest: (selector) ->
    new DfDomElement @map (item) ->
      ((new DfDomElement item).parents selector).first()._get 0

  # TODO: refactor all these stuff

  _first: () ->
    @_get(0)

  first: () ->
    return  new DfDomElement @_first()

  _get: (key) ->
    if @element and @element.length > key
      return @element[key]
    return @element

  get: (key) ->
    if key? then @element[key] or null else @element

  length: () ->
    return @element.length

  # CONTENT RETRIEVING AND INJECTION

  ###*
   * Sets the HTML contents of each element in the set of matched elements. If
   * called with no arguments retrieves the HTML of the first element in the set
   * of matched elements.
   *
   * @public
   * @param  {string} htmlContent   HTML source code to insert. Optional.
   * @return {DfDomElement|string}  The same instance if is a set operation.
   *                                The HTML source code if is get operation.
  ###
  html: (htmlContent) ->
    if htmlContent?
      @each (node) -> node.innerHTML = htmlContent
    else
      @_first().innerHTML

  ###*
   * Clones a HTMLElement node or returns the same if it's a HTML string.
   * @public
   * @param  {HTMLElement|string} node The node to be cloned.
   * @return {HTMLElement|string}      The copy or the same string.
  ###
  __cloneNode: (node) ->
    switch
      when typeof node is "string" then node
      when node instanceof HTMLElement then node.cloneNode true
      else throw "Invalid argument: #{node}"

  ###*
   * Prepends a node or HTML into the set of matched elements. If the child is a
   * HTMLElement then new copies are created when there're more than 1 item in
   * the set. If the child is a DfDomElement instance, all its matched elements
   * are "prepended" individually.
   *
   * @public
   * @param  {DfDomElement|HTMLElement|string} child Stuff to be prepended.
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
        else if child instanceof HTMLElement
          newChild = (if i is 0 then child else @__cloneNode child)
          if node.children?.length > 0
            node.insertBefore newChild, node.children[0]
          else
            node.appendChild newChild

  ###*
   * Appends a node or HTML into the set of matched elements. If the child is a
   * HTMLElement then new copies are created when there're more than 1 item in
   * the set. If the child is a DfDomElement instance, all its matched elements
   * are appended individually.
   *
   * @public
   * @param  {DfDomElement|HTMLElement|string} child Stuff to be appended.
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
        else if child instanceof HTMLElement
          node.appendChild (if i is 0 then child else @__cloneNode child)

  ###*
   * Inserts a node or HTML before the set of matched elements. If the node is a
   * HTMLElement then new copies are created when there're more than 1 item in
   * the set. If the node is a DfDomElement instance, all its matched elements
   * are inserted before the current set.
   *
   * @public
   * @param  {DfDomElement|HTMLElement|string} child Stuff to be inserted.
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
        else if sibling instanceof HTMLElement
          newSibling = (if i is 0 then sibling else @__cloneNode sibling)
          node.parentElement.insertBefore newSibling, node

  ###*
   * Inserts a node or HTML after the set of matched elements. If the node is a
   * HTMLElement then new copies are created when there're more than 1 item in
   * the set. If the node is a DfDomElement instance, all its matched elements
   * are inserted before the current set.
   *
   * @public
   * @param  {DfDomElement|HTMLElement|string} child Stuff to be inserted.
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
        else if sibling instanceof HTMLElement
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
   * @param  {string} name              Attribute name.
   * @param  {string} value             Attribute value.
   * @return {DfDomElement|string|null} Current instance on set, attribute
   *                                    value on get.
  ###
  attr: (name, value) ->
    if value?
      @each (node) -> node.setAttribute name, value
    else
      @_first()?.getAttribute name

  ###*
   * Removes an attribute from the set of matched elements.
   * @public
   * @param  {string} name          Attribute name.
   * @return {DfDomElement|string}  Current instance.
  ###
  removeAttr: (name) ->
    @each (node) -> node.removeAttribute name

  ###*
   * Checks whether all the elements in the set of matched elements have certain
   * attribute or not.
   *
   * @public
   * @param  {string} name  Attribute name.
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
   * @param  {string} name              Attribute name.
   * @param  {string} value             Attribute value.
   * @return {DfDomElement|string|null} Current instance on set,
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
        node.value = value if node.__proto__.hasOwnProperty "value"
    else if (node = @_first())?.__proto__.hasOwnProperty "value"
      node.value
    else
      undefined

  ###*
   * Adds a class name to all the elements in the set of matched elements.
   * @public
   * @param {string} className
  ###
  addClass: (className) ->
    @each (node) -> node.classList.add className

  ###*
   * Checks whether all elements in the set of matched elements have a certain
   * class name.
   *
   * @public
   * @param {string} className
  ###
  hasClass: (className) ->
    (@element.filter (node) -> node.classList.contains className).length > 0

  ###*
   * Removes a class name from all the elements in the set of matched elements.
   * @public
   * @param {string} className
  ###
  removeClass: (className) ->
    @each (node) -> node.classList.remove className

  ###*
   * Toggles the presence of certain class name for the elements in the set of
   * matched elements.
   *
   * @public
   * @param {string} className
  ###
  toggleClass: (className) ->
    @each (node) -> node.classList.toggle className

  #
  # Styles
  #

  # TODO(@carlosescri): I'm here!

  __css: (node, propertyName) ->
    (getComputedStyle node).getPropertyValue propertyName

  css: (propertyName, value) ->
    if value?
      @each (node) -> node.style[propertyName] = value
    else if (node = @get 0)?
      @__css node, propertyName
    else
      null

  hide: ->
    @css "display", "none"

  show: ->
    @each (node) -> node.style.removeProperty "display"

  #
  # Measurements
  #

  width: () ->
    @_first()?.offsetWidth

  height: () ->
    @_first()?.offsetHeight

  _clientRect: ->
    @_first()?.getBoundingClientRect?()

  top: ->
    @_clientRect()?.top or 0

  right: ->
    @_clientRect()?.right or 0

  bottom: ->
    @_clientRect()?.bottom or 0

  left: () ->
    @_clientRect()?.left or 0

  scrollTop: (value) ->
    if typeof(value) != "undefined"
      @_first().scrollTop = value
    @_first().scrollY || @_first().scrollTop

  scrollLeft: () ->
    @_first().scrollLeft

  #
  # Events
  #

  on: (arg1, arg2, arg3) ->
    if arg3?
      @each (elem) ->
        if elem?
          bean.on(elem, arg1, arg2, arg3)
    else
      @each (elem) ->
        if elem?
          bean.on(elem, arg1, arg2)


  one: (arg1, arg2, arg3) ->
    if arg3?
      @each (elem) ->
        if elem?
          bean.one(elem, arg1, arg2, arg3)
    else
      @each (elem) ->
        if elem?
          bean.one(elem, arg1, arg2)
    return @

  trigger: (event, params) ->
    @each (elem) ->
      if elem?
        bean.fire(elem, event, params)
    return @

  off: (event) ->
    @each (elem) ->
      if elem?
        bean.off(elem, event)
    return @

  focus: () ->
    if @_first()?
      @_first().focus()

  blur: () ->
    if @_first()?
      @_first().blur()


dfdom = (selector) ->
  if selector?
    switch
      when selector instanceof DfDomElement then selector
      else new DfDomElement selector


module.exports = dfdom
