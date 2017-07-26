bean = require "bean"
extend = require "extend"
qs = require "qs"

thing = require "./util/thing"

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
  @param {Object} searchParams
  @api public
  ###
  constructor: (client, widgets, @searchParams = {}) ->
    @client = client
    @hashid = client.hashid # Publish hashid
    @widgets = []
    if thing.isArray widgets
      for widget in widgets
        @addWidget(widget)

    else if widgets
      @addWidget(widgets)

    @status = extend true,
      {},
      params: extend true, {}, @searchParams

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

    params = extend true,
      {},
      @status.params || {}

    params.page = @status.currentPage
    _this = this

    @client.search params.query, params, (err, res) ->
      # I check if I reached the last page.
      if err
        # Triggers error_received on search error
        _this.trigger "df:error_received", [err]

      else if res
        if res.results.length < _this.status.params.rpp
          _this.status.lastPageReached = true
        # I set the query_name till next query
        if not _this.searchParams.query_name
          _this.status.params.query_name = res.query_name
        # Triggers results_received
        _this.trigger "df:results_received", [res]
        # Whe show the results only when query counter
        # belongs to a the present request
        if res.query_counter == _this.status.params.query_counter
          for widget in _this.widgets
            if next
              widget.renderNext res
            else
              widget.render res
          # TODO(@carlosescri): This could trigger an event.

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
    if query
      searchParams = extend true,
        {},
        @searchParams
      # Saves current query counter
      queryCounter = @status.params.query_counter
      # Reset @status.params
      @status.params = extend true,
        {},
        params
      @status.params = extend true, searchParams, params
      @status.params.query = query
      @status.params.filter = extend true,
        {},
        @searchParams.filter || {},
        params.filter
      @status.params.query_counter = queryCounter

      if not @searchParams.query_name
        delete @status.params.query_name

      @status.currentPage = 1
      @status.firstQueryTriggered = true
      @status.lastPageReached = false
      @__search()

    @trigger "df:search", [@status.params]

  ###
  nextPage

  Increments the currentPage and performs a search. Takes
  the next page results and shows them.

  @api public
  ###
  nextPage: (replace = false) ->
    if @status.firstQueryTriggered and @status.currentPage > 0 and not @status.lastPageReached
      @trigger "df:next_page"
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
    if @status.firstQueryTriggered and @status.currentPage > 0
      @trigger "df:get_page"
      @status.currentPage = page
      self = this
      @__search()

  ###
  refresh

  Makes a search call with the current status.

  @api public
  ###

  refresh: () ->
    if @status.params.query
      @trigger "df:refresh", [@status.params]
      @status.currentPage = 1
      @status.firstQueryTriggered = true
      @status.lastPageReached = false
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
    if not @status.params.filter
      @status.params.filter = {}
    # Range filters
    if value.constructor == Object
      @status.params.filter[key] = value
      # Range predefined filters are removed when
      # the user interacts
      if @searchParams.filter and @searchParams.filter[key]
        delete @searchParams.filter[key]
    # Term filter
    else
      if not @status.params.filter[key]
        @status.params.filter[key] = []
      if value.constructor != Array
        value = [value]
      @status.params.filter[key] = @status.params.filter[key].concat value


  hasFilter: (key) ->
    @status.params.filter?[key]?

  getFilter: (key) ->
    @status.params.filter?[key]

  ###
  addParam

  Adds new search parameter to the current status.

  @param {String} key: the facet key you are filtering
  @param {String | Number} value: the filtering criteria
  @api public
  ###
  addParam: (key, value) ->
    @status.params[key] = value


  ###
  clearParam

  Removes search parameter from current status.

  @param {String} key: the name of the param
  @api public
  ###
  clearParam: (key) ->
    delete @status.params[key]

  ###
  reset

  Reset the params to the initial state.

  @api public
  ###
  reset: () ->
    queryCounter = @status.params.query_counter || 1
    @status =
      params: extend true, {}, @searchParams
      currentPage: 0
      firstQueryTriggered: false
      lastPageReached: false

    @status.params.query_counter = queryCounter

    if @searchParams.query
      @status.params.query = ''

  ###
  removeFilter

  Removes some filter criteria.

  @param {String} key: the facet key you are filtering
  @param {String | Object} value: the filtering criteria you are removing
  @api public
  ###
  removeFilter: (key, value) ->
    @status.currentPage = 1
    if @status.params.filter?[key]?
      if @status.params.filter[key].constructor == Object
        delete @status.params.filter[key]
      else if @status.params.filter[key].constructor == Array
        if value?
          @__splice @status.params.filter[key], value
          unless @status.params.filter[key].length > 0
            delete @status.params.filter[key]
        else
          delete @status.params.filter[key]

    # Removes a predefined filter when it is deselected.
    if @searchParams.filter?[key]?
      if @searchParams.filter[key].constructor == Object
        delete @searchParams.filter[key]
      else if @searchParams.filter[key].constructor == Array
        if value?
          @__splice @searchParams.filter[key], value
          unless @searchParams.filter[key].length > 0
            delete @searchParams.filter[key]
        else
          delete @searchParams.filter[key]

  __splice: (list, value) ->
    idx = list.indexOf value
    while idx >= 0
      list.splice idx, 1
      idx = list.indexOf value
    list


  ###
  setSearchParam

  Removes some filter criteria.

  @param {String} key: the param key
  @param {Mixed} value: the value
  @api public
  ###
  setSearchParam: (key, value) ->
    @searchParams[key] = value

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
  options

  Retrieves the SearchEngine options

  @param {Function} callback
  ###
  options: (args...) ->
    @client.options args...

  ###
  bind

  Method to add and event listener
  @param {String} event
  @param {Function} callback
  @api public
  ###
  bind: (event, callback) ->
    bean.on(this, event, callback)

  ###
  trigger

  Method to trigger an event
  @param {String} event
  @param {Array} params
  @api public
  ###
  trigger: (event, params) ->
    bean.fire(this, event, params)

  ###
  setStatusFromString

  Fills in the status from queryString
  and searches.
  ###
  setStatusFromString: (queryString, prefix="#/search/") ->
    @status.firstQueryTriggered = true
    @status.lastPageReached = false
    searchParams = extend true,
      {},
      @searchParams || {}
    @status.params = extend true,
      searchParams,
      qs.parse(queryString.replace("#{prefix}", "")) || {}
    @status.params.query_counter = 1
    @status.currentPage = 1
    @refresh()
    return @status.params.query

  ###
  statusQueryString

  Method to represent current status
  with a queryString
  ###
  statusQueryString: (prefix="#/search/") ->
    params = extend true, {}, @status.params

    delete params.transformer
    delete params.rpp
    delete params.query_counter
    delete params.page

    "#{prefix}#{qs.stringify params}"


module.exports = Controller
