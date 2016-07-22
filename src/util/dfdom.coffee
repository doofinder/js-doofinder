###
dfdom.coffee
author: @ecoslado
2016 07 05
###


bean = require "bean"

###
DfDomElement
This class manages an set of
DOM elements identified by a selector
###
class DfDomElement

  constructor: (@element) ->
    if typeof @element is "string"
      @element = Array.prototype.slice.call document.querySelectorAll @element
    if @element.constructor != Array
      @element = [@element]
    return this
  
  # NODE HIERARCHY MANAGEMENT  
  find: (selector) ->  
    return new DfDomElement Array.prototype.slice.call @_first().querySelectorAll selector

  each: (callback) ->
    @element.forEach(callback)
      
  children: () ->
    new DfDomElement Array.prototype.slice.call @_first().children

  parent: () ->
    new DfDomElement @_first().parentElement

  closest: (selector) ->
    matchesFn = null
    el = @_first()
    # find vendor prefix
    ['matches','webkitMatchesSelector','mozMatchesSelector','msMatchesSelector','oMatchesSelector'].some (fn) ->
      if (typeof document.body[fn] == 'function')
        matchesFn = fn
        return true

      return false
    parent = null
    # traverse parents
    while (el)
      parent = el.parentElement
      if (parent && parent[matchesFn](selector))
        return new DfDomElement parent
      el = parent
    return null

  parents: (selector) ->
    matchesFn = null
    ['matches','webkitMatchesSelector','mozMatchesSelector','msMatchesSelector','oMatchesSelector'].some (fn) ->
      if (typeof document.body[fn] == 'function')
        matchesFn = fn
        return true

      return false
    parents = []
    if @_first() and @_first().parentElement
      p = @_first().parentElement
      while (p != null)
        o = p
        if not selector? or o[matchesFn](selector)
          parents.push(o)
   
        p = o.parentElement
    return new DfDomElement parents

  _first: () ->
    if @element and @element.length
      return  @element[0]
    return @element

  first: () ->
    return  new DfDomElement @_first()

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

  attr: (key, value) ->
    first = @_first()
    if first? and first.getAttribute?
      if typeof(value) != "undefined"
        first.setAttribute(key,value)
      return first.getAttribute(key)

  removeAttr: (key) ->
    first = @_first()
    if first? and first.removeAttribute?
      first.removeAttribute(key)
    return this
    
  data: (key, value) ->
    actualKey = "data-#{key}"
    return @attr(actualKey, value)

  val: (value) ->
    if typeof(value) != "undefined"
      @_first().value = value
    return @_first().value

  # STYLES
  width: () ->
    first = @_first()
    if first?
      Math.max first.clientWidth, first.offsetWidth

  height: () ->
    first = @_first()
    if first?
      Math.max first.clientHeight, first.offsetHeight

  top: () ->
    first = @_first()
    if first? and first.getBoundingClientRect()
      return first.getBoundingClientRect().top
    else
      return 0


  left: () ->
    first = @_first()
    if first? and first.getBoundingClientRect()
      return @_first().getBoundingClientRect().left
    else
      return 0

  scrollTop: (value) ->
    if typeof(value) != "undefined"
      @_first().scrollTop = value
    @_first().scrollTop

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
    return new DfDomElement selector


module.exports = dfdom