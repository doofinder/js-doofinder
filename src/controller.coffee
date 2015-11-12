###
# Created by Kike Coslado on 26/10/15.
###

jqDf = require('jquery')
  
class Controller
  constructor = (client, results_displayers, params) ->
    @client = client
    if resultsDisplayers instanceof Array
      @resultsDisplayers = resultsDisplayers
    else
      @resultsDisplayers = [ resultsDisplayers ]
    # Initial params and filters for queries.
    @predefinedParams = params or {}
    @predefinedFilters = filters or {}
    # Initial status
    @status =
      filters: filters or {}
      params: params or {}
      query: ''
      currentPage: 1
      firstQueryTriggered: false
      lastPageReached: false
  
  __triggerAll: (event, params) ->
    for results_displayer of @results_displayers
      results_displayer.trigger(event, params)

  __query: (event) ->
    query = @status.query
    params = jqDf.extend(true, @status.params, filters: @status.filters or {})
    params.page = @status.currentPage
    self = this
    lastPageReached = true
    @client.search query, params, (err, res) ->
      if res.results.length < self.status.params.rpp
        self.status.lastPageReached = lastPageReached
      @__triggerAll event, [res]
    
  query: (query) ->
    if query
      @status.query = query
    @status.filters = @predefinedFilters
    @status.params = @predefinedParams
    @status.currentPage = 1
    @status.firstQueryTriggered = true
    @status.lastPageReached = false
    self = this
    for key of self.resultsDisplayers
      self.resultsDisplayers[key].triggerAll 'df:new_query'
    @__query "df:new_query"

  nextPage: ->
    if @status.firstQueryTriggered and !@status.lastPageReached
      @status.currentPage++
      self = this
      @__query "df:next_page"

  getPage: (page) ->
    @status.currentPage = page
    self = this
    @__query "df:get_page"

module.exports = Controller
