###
# Created by Kike Coslado on 26/10/15.
###

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
  constructor: (client, displayers, @initialParams = {}) ->
    @client = client
    if displayers instanceof Array
      @displayers = displayers
    else
      @displayers = [ displayers ]
    
    # Initial status
    @status =
      params: @initialParams or {}
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
  __search: (replace) ->
    query = @status.query
    params = @status.params or {}
    params.page = @status.currentPage
    self = this
    lastPageReached = true
    @client.search query, params, (err, res) ->
      self.__triggerAll "df:results_received", res
      for displayer in self.displayers
        if replace
          displayer.replace res
        else
          displayer.append res
      
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
  search: (query) ->
    @__triggerAll "df:search"
    if query
      @status.query = query
    if not @status
      @status = {}  
    @status.params = @initialParams
    @status.currentPage = 1
    @status.firstQueryTriggered = true
    @status.lastPageReached = false
    @__search(true)

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
      @__search(replace)

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
      @__search(true)

  refresh: () ->
    @__search(true)

module.exports = Controller
