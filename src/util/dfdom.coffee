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
    return this

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

  ###*
   * Iterates over nodes in the store, passing them to the callback, and stores
   * the result of the callback in an array.
   * @public
   * @param  {Function} callback
   * @return {Array}
  ###
  map: (callback) ->
    @element.map callback

  ###*
   * Iterates over nodes in the store, passing them to a "finder" callback that
   * should return a NodeList (or compatible object) with nodes found for the
   * passed item. Found nodes are stored all together and returned at the end
   * of the function call.
   * @protected
   * @param  {Function} nodeFinder Finder function that finds more nodes
   *                               starting from the received one.
   * @return {Array}               Array with all the nodes found.
  ###
  __expand: (nodeFinder) ->
    results = []
    @each (rootNode) ->
      start = (Math.max results.length - 1, 0)
      args = [start, 0].concat (nodeFinder rootNode)
      Array.prototype.splice.apply results, args
    results

  ###*
   * Finds nodes that match the passed selector starting from each element in
   * the store.
   * @public
   * @param  {string} selector CSS Selector.
   * @return {DfDomElement}
  ###
  find: (selector) ->
    nodeFinder = (item) => @__fixNodeList item.querySelectorAll selector
    new DfDomElement @__expand nodeFinder

  ###*
   * Returns all the children of the elements in the store in a DfDomElement
   * instance.
   * @public
   * @return {DfDomElement}
  ###
  children: ->
    childFinder = (item) => @__fixNodeList item.children
    new DfDomElement @__expand childFinder

  ###*
   * Returns all the parent nodes of the elements in the store in a DfDomElement
   * instance. Duplicates are removed.
   * @public
   * @return {DfDomElement}
  ###
  parent: ->
    parentNodes = @map (item) -> item.parentElement
    new DfDomElement parentNodes

  # TODO(@carlosescri): I'm here!

  closest: (selector) ->
    el = @_first()
    parent = null
    # traverse parents
    while (el)
      parent = el.parentElement
      if (parent and parent[MATCHES_SELECTOR_FN](selector))
        return new DfDomElement parent
      el = parent
    return new DfDomElement []

  parents: (selector) ->
    parents = []
    if @_first() and @_first().parentElement
      p = @_first().parentElement
      while p?
        o = p
        if not selector? or o[MATCHES_SELECTOR_FN](selector)
          parents.push(o)
        p = o.parentElement
    return new DfDomElement parents

  _first: () ->
    @_get(0)

  first: () ->
    return  new DfDomElement @_first()

  _get: (key) ->
    if @element and @element.length > key
      return @element[key]
    return @element

  get: (key) ->
    return new DfDomElement @_get(key)

  length: () ->
    return @element.length

  # CONTENT RETRIEVING AND INJECTION
  html: (htmlString) ->
    @each (elem) ->
      elem.innerHTML = htmlString
    return this

  append: (fragment) ->
    @each (elem) ->
      if typeof fragment is "string" and elem.insertAdjacentHTML?
        elem.insertAdjacentHTML  "beforeend", fragment
      else if typeof fragment is "string" and not elem.insertAdjacentHTML?
        elem.innerHTML += fragment
      else if fragment.tagName?
        elem.appendChild fragment
      else if fragment._first?
        elem.appendChild fragment._first()

    return this

  prepend: (fragment) ->
    @each (elem) ->
      if typeof fragment is "string" and elem.insertAdjacentHTML?
        elem.insertAdjacentHTML  "afterbegin", fragment
      else if typeof fragment is "string" and not elem.insertAdjacentHTML?
        elem.innerHTML = fragment + elem.innerHTML
      else
        if not fragment.tagName
          fragment = fragment._first()
        if elem.children and elem.children.length > 0
          elem.insertBefore fragment, elem.children[0]
        else
          elem.appendChild fragment

  before: (fragment) ->
    @each (elem) ->
      if typeof fragment is "string"
        elem.insertAdjacentHTML  "beforebegin", fragment
      else if fragment.tagName
        elem.parentElement.insertBefore fragment, elem
      else
        elem.parentElement.insertBefore fragment._first(), elem

  after: (fragment) ->
    @each (elem) ->
      if typeof fragment is "string"
        elem.insertAdjacentHTML  "afterend", fragment
      else if fragment.tagName
        elem.parentElement.appendChild fragment
      else
        elem.parentElement.appendChild fragment._first()
    return this

  empty: (htmlString) ->
    @html("")

  # TAG ATTRIBUTES
  attr: (key, value) ->
    first = @_first()
    if first?.getAttribute?
      if typeof(value) != "undefined"
        first.setAttribute(key,value)
      return first.getAttribute(key)

  removeAttr: (key) ->
    @each (item) ->
      item.removeAttribute(key)
    return this

  hasAttr: (key) ->
    @attr(key)? and @attr(key) != ""

  data: (key, value) ->
    actualKey = "data-#{key}"
    return @attr(actualKey, value)

  val: (value) ->
    if typeof(value) != "undefined"
      @_first().value = value
    return @_first().value

  # STYLES

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

  addClass: (className) ->
    @each (elem) ->
      elem.classList.add className
    return this

  removeClass: (className) ->
    @each (elem) ->
      elem.classList.remove className
    return this

  toggleClass: (className) ->
    @each (elem) ->
      elem.classList.toggle className
    return this

  hasClass: (className) ->
    @_first().classList.contains className

  css: (key, value) ->
    @each (elem) ->
      elem.style[key] = value
    return getComputedStyle(@_first())[key]

  hide: () ->
    @css "display", "none"

  show: () ->
    @css "display", "block"

  remove: () ->
    first = @_first()
    if first? and first.parentNode?
      first.parentNode.removeChild(@_first())

  # EVENTS
  on: (arg1, arg2, arg3) ->
    if arg3?
      @each (elem) ->
        if elem?
          bean.on(elem, arg1, arg2, arg3)
    else
      @each (elem) ->
        if elem?
          bean.on(elem, arg1, arg2)
    return this

  one: (arg1, arg2, arg3) ->
    if arg3?
      @each (elem) ->
        if elem?
          bean.one(elem, arg1, arg2, arg3)
    else
      @each (elem) ->
        if elem?
          bean.one(elem, arg1, arg2)
    return this

  trigger: (event, params) ->
    @each (elem) ->
      if elem?
        bean.fire(elem, event, params)
    return this

  off: (event) ->
    @each (elem) ->
      if elem?
        bean.off(elem, event)
    return this

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
