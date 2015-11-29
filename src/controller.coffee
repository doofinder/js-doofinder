###
# Created by Kike Coslado on 26/10/15.
###

$ = require("./util/jquery")

###
Controller
  
This class uses the client to
to retrieve the data and the widgets
to paint them.
###  
class Controller
  ###
  Controller constructor
  
  @param {doofinder.Client} client
  @param {doofinder.widget | Array} widgets
  @param {Object} initialParams
  @api public
  ###
  constructor: (client, widgets, initialParams = {}) ->
    @client = client
    @widgets = []
    @__started = false
    if widgets instanceof Array
      for widget in widgets
        @addWidget(widget)

    else
      @addWidget(widgets)
    
    # Initial status
    @initialParams = $.extend true, initialParams, {query_counter: 0}
    @status =
      params: @initialParams
      query: ''
      currentPage: 0
      firstQueryTriggered: false
  
  ###
  __triggerAll
  this function triggers an event
  for every resultwidget
  
  @param {String} event: the event name
  @param {Array} params: the params will be passed
    to the listeners
  @api private
  ###
  __triggerAll: (event, params) ->
    for widget in @widgets
      widget.trigger(event, params)

  ###
  __search
  this method invokes Client's search method for
  retrieving the data and use widget's replace or 
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
        for widget in self.widgets
          if next
            widget.renderNext res
          else
            widget.render res
        
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
    @status.params = $.extend true, @initialParams, params
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
    @__triggerAll "df:search"
    @__search()

  ###
  addFilter
  
  Adds new filter criteria.

  @param {String} key: the facet key you are filtering
  @param {String | Object} value: the filtering criteria
  @api public
  ###
  addFilter: (key, value) ->
    #if value.constructor != Object and value.constructor != String
     # throw Error "wrong value. Object or String expected, #{value.constructor} given"
    @status.currentPage = 1
    if not @status.params.filters
      @status.params.filters = {}
    if value.constructor == Object
      @status.params.filters[key] = value
    else if not @status.params.filters[key]
      @status.params.filters[key] = [value]
    else
      @status.params.filters[key].push value 
  
  ###
  removeFilter
  
  Removes some filter criteria.
  
  @param {String} key: the facet key you are filtering
  @param {String | Object} value: the filtering criteria you are removing
  @api public
  ###
  removeFilter: (key, value) ->
    @status.currentPage = 1
    if not @status.params.filters and not @status.params.filters[key]
      # DO NOTHING

    else if @status.params.filters[key].constructor == Object
      delete @status.params.filters[key]

    else if @status.params.filters[key].constructor == Array 
      index = @status.params.filters[key].indexOf(value)
      while index >= 0
        @status.params.filters[key].pop(index)
        # Just in case it is repeated
        index = @status.params.filters[key].indexOf(value)

  ###
  addwidget

  Adds a new widget to the controller and reference the 
  controller from the widget.

  @param {doofinder.widget} widget: the widget you are adding.
  @api public
  ###

  addWidget: (widget) ->
    @widgets.push(widget)
    widget.controller = this
    widget.start()

module.exports = Controller
