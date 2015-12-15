###
# Created by Kike Coslado on 26/10/15.
###

$ = require "./util/jquery"
qs = require "qs"

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
    if widgets instanceof Array
      for widget in widgets
        @addWidget(widget)

    else if widgets
      @addWidget(widgets)
    
    # Initial status
    @initialParams = $.extend true, initialParams, {query_counter: 0}
    @reset()

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
    _this = this
    @client.search query, params, (err, res) ->
      _this.trigger "df:results_received", [res]
      # Whe show the results only when query counter
      # belongs to a the present request
      if res.query_counter == _this.status.params.query_counter
        for widget in _this.widgets
          if next
            widget.renderNext res
          else
            widget.render res
        
        # I check if I reached the last page.    
        if res.results.length < _this.status.params.rpp
          _this.status.lastPageReached = true
  
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
    @trigger "df:search"
    if query
      @status.query = query
    
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
    @trigger "df:next_page"
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
    @trigger "df:get_page"
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
    @trigger "df:refresh"
    @status.currentPage = 1
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
  addParam
  
  Adds new filter criteria.

  @param {String} key: the facet key you are filtering
  @param {String | Number} value: the filtering criteria
  @api public
  ###
  addParam: (key, value) -> 
    @status.params[key] = value


  ###
  clearParam
  
  Adds new filter criteria.

  @param {String} key: the facet key you are filtering
  @api public
  ###
  clearParam: (key) ->
    if key in @status.params 
      delete @status.params[key]

  ###
  reset
  
  Reset the params to the initial state.

  @api public
  ###
  reset: () ->
    @status =
      params: @initialParams
      query: ''
      currentPage: 0
      firstQueryTriggered: false
      lastPageReached: false
  
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
        @status.params.filters[key].splice(index, 1)
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
    widget.init(this)

  ###
  hit

  Increment the hit counter when a product is clicked.

  @param {String} dfid: the unique identifier present in the search result
  @param {Function} callback
  ###
  hit: (dfid, callback) ->
    @client.hit dfid, @status.query, callback


  ###
  options

  Retrieves the SearchEngine options

  @param {Function} callback
  ###
  options: (callback) ->
    @client.options callback

  ###
  sendToGA
  
  Send the a command to Google Analytics

  @param {Object} gaCommand: the command for GA 
    eventCategory: "xxx" 
    eventLabel: "xxx" 
    eventAction: "xxx"
  ###
  sendToGA: (gaCommand) ->
    if window._gaq and window._gaq.push
      # Classic Analytics
      window._gaq.push ['_trackEvent', gaCommand['eventCategory'],
        gaCommand['eventAction'],
        gaCommand['eventLabel']]

      if gaCommand['eventAction'].indexOf('search') == 0  # also send pageview to count on search analytics
        window._gaq.push(['_trackPageview', '/doofinder/search/' + options.hashid + '?query=' + gaCommand['eventLabel']])
      else
      # Universal Analytics
        ga = (window[window.GoogleAnalyticsObject] || window.ga);
      if (ga and ga.getAll)
      # http://stackoverflow.com/q/28765806/316414
        trackerName = ga.getAll()[0].get('name');
        ga(trackerName + '.send', 'event', gaCommand);
        if gaCommand['eventAction'].indexOf('search') == 0  # also send pageview to count on search analytics
          ga(trackerName + '.send', 'pageview', '/doofinder/search/' + options.hashid + '?query=' + gaCommand['eventLabel'])

  ###
  bind

  Method to add and event listener
  @param {String} event
  @param {Function} callback
  @api public
  ###
  bind: (event, callback) ->
    $(this).on(event, callback)

  ###
  trigger

  Method to trigger an event
  @param {String} event
  @param {Array} params
  @api public
  ###
  trigger: (event, params) -> 
    $(this).trigger(event, params)

  

  ###
  setStatusFromString

  Fills in the status from queryString
  and searches.
  ###
  setStatusFromString: (queryString) ->          
    params = qs.parse(queryString.replace("#search/", ""))
    @status.firstQueryTriggered = true
    @status.currentPage = params.page
    @status.query = params.query
    @status.params = params
    @refresh()

  ###
  statusQueryString

  Method to represent current status
  with a queryString
  ###
  statusQueryString: () ->
    return "#search/" + qs.stringify @status.params


module.exports = Controller
