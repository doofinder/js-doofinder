###
# Created by Kike Coslado on 26/10/15.
###

extend = require('./util/extend').extend

###
Controller
  
This class uses the client to
to retrieve the data and the displayers
to paint them.
###  
class Controller
  ###
  Controller constructor
  
  @param {doofinder.Client} client
  @param {doofinder.Displayer | Array} displayers
  @param {Object} initialParams
  @api public
  ###
  constructor: (client, displayers, initialParams = {}) ->
    @client = client
    @displayers = []
    if displayers instanceof Array
      for displayer in displayers
        @addDisplayer(displayer)
    else
      @addDisplayer(displayers)
    
    # Initial status
    @initialParams = extend(initialParams, {query_counter: 0})
    @status =
      params: @initialParams
      query: ''
      currentPage: 0
      firstQueryTriggered: false
  
  ###
  __triggerAll
  this function triggers an event
  for every resultDisplayer
  
  @param {String} event: the event name
  @param {Array} params: the params will be passed
    to the listeners
  @api private
  ###
  __triggerAll: (event, params) ->
    for displayer in @displayers
      displayer.trigger(event, params)

  ###
  __search
  this method invokes Client's search method for
  retrieving the data and use Displayer's replace or 
  append to show them.
  
  @param {String} event: the event name
  @param {Array} params: the params will be passed
    to the listeners
  @api private
  ###
  __search: (next=false) ->

    # To avoid past queries
    # we'll check the query_counter
    @status.params.query_counter++
    query = @status.query
    params = @status.params
    params.page = @status.currentPage
    self = this
    lastPageReached = true
    @client.search query, params, (err, res) ->
      self.__triggerAll "df:results_received", res
      # Whe show the results only when query counter
      # belongs to a the present request
      if res.query_counter == self.status.params.query_counter
        for displayer in self.displayers
          if next
            displayer.renderNext res
          else
            displayer.render res
        
        # I check if I reached the last page.    
        if res.results.length < self.status.params.rpp
          self.status.lastPageReached = lastPageReached
  
  ### 
  __search wrappers
  ###

  ###
  search
  
  Takes a new query, initializes status and performs
  a search

  @param {String} query: the query term
  @api public
  ###
  search: (query, params={}) ->
    @__triggerAll "df:search"
    if query
      @status.query = query
    if not @status
      @status = {}  
    @status.params = extend(@initialParams, params)
    @status.currentPage = 1
    @status.firstQueryTriggered = true
    @status.lastPageReached = false
    @__search()

  ###
  nextPage
  
  Increments the currentPage and performs a search. Takes
  the next page results and shows them.

  @api public
  ###
  nextPage: (replace = false) ->
    @__triggerAll "df:next_page"
    if @status.firstQueryTriggered and @status.currentPage > 0 and not @status.lastPageReached      
      @status.currentPage++
      @__search(true)

  ###
  getPage
  
  Set the currentPage with a given value and performs a search.
  Takes a given page and shows the results.

  @param {Number} page: the page you are retrieving
  @api public
  ###

  getPage: (page) ->
    @__triggerAll "df:get_page"
    if @status.firstQueryTriggered and @status.currentPage > 0
      @status.currentPage = page
      self = this
      @__search()

  ###
  refresh
  
  Makes a search call with the current status.

  @api public
  ###

  refresh: () ->
    @__search()

  ###
  addFilter
  
  Makes a search call adding new filter criteria.

  @param {String} key: the facet key you are filtering
  @param {String | Object} value: the filtering criteria
  @api public
  ###
  addFilter: (key, value) ->
    if value.constructor != Object or value.constructor != String
      throw Error "wrong value. Object or String expected, #{value.constructor} given"

    if not @status.params.filters
      @status.params.filters = {}

    if value.constructor == Object
      @status.params.filters[key] = value
    else if not @status.params.filters[key]
      @status.params.filters[key] = [value]
    else
      @status.params.filters[key].push value 

    @__search()
  
  ###
  removeFilter
  
  Makes a search call removing some filter criteria.
  
  @param {String} key: the facet key you are filtering
  @param {String | Object} value: the filtering criteria you are removing
  @api public
  ###
  removeFilter: (key, value) ->
    if not @status.params.filters and not @status.params.filters[key]
      # DO NOTHING

    else if @status.params.filters[key].constructor == Object
      delete @status.params.filters[key]

    else if @status.params.filters[key].constructor == Array and @status.params.filters[key].indexOf(value) >= 0
      index = @status.params.filters[key].indexOf(value)
      @status.params.filters[key].pop(index)

    @__search()

  ###
  addDisplayer

  Adds a new displayer to the controller and reference the 
  controller from the displayer.

  @param {doofinder.Displayer} displayer: the displayer you are adding.
  @api public
  ###

  addDisplayer: (displayer) ->
    @displayers.push(displayer)
    displayer.controller = this



module.exports = Controller
