bean = require "bean"
extend = require "extend"
qs = require "qs"

Client = require "./client"

Freezer = require "./util/freezer"
Thing = require "./util/thing"

###
Controller

This class uses the client to
to retrieve the data and the widgets
to paint them.
###
class Controller
  constructor: (@client, @widgets = [], defaultParams = {}) ->
    unless @client instanceof Client
      throw @error "client must be an instance of Client"

    unless Thing.isArray @widgets
      throw @error "widgets must be an instance of Array"

    unless Thing.isPlainObj defaultParams
      throw @error "defaultParams must be an instance of Object"

    # controller needs page and rpp to do calculations
    defaults =
      query_name: null
      page: 1
      rpp: 10

    @defaults = extend true, defaults, (@__fixParams defaultParams)
    @queryCounter = 0

    # TODO(@carlosescri): Find a better way to subscribe widgets
    (@addWidget widget) for widget in @widgets

    Object.defineProperty @, 'hashid', get: ->
      @client.hashid

    Object.defineProperty @, 'isFirstPage', get: ->
      @requestDone and @params.page is 1

    Object.defineProperty @, 'isLastPage', get: ->
      @requestDone and @params.page is @lastPage

    @reset()

  error: (message) ->
    new Error "#{@constructor.name}: #{message}"

  deprecate: (message) ->
    console.warn "[DEPRECATED][#{@constructor.name}]: #{message}" if console?

  #
  # Status
  #

  ###*
   * Fixes any deprecations in the search parameters.
   *
   * - Client now expects "filter" instead of "filters" because the parameters
   *   are sent "as is" in the querystring, no re-processing is made.
   *
   * @param  {Object} params
   * @return {Object}
   * @protected
  ###
  __fixParams: (params) ->
    if params.filters?
      params.filter = params.filters
      delete params.filters
      @deprecate "`filters` key is deprecated for search parameters, use `filter` instead"
    params

  ###*
   * Resets status and optionally forces query and params. As it is a reset
   * aimed to perform a new search, page is forced to 1 in any case.
   *
   * - done      - true if at least one request has been sent.
   * - lastPage  - indicates the number of the last page for the current status.
   *
   * @param  {String} query  Search terms.
   * @param  {Object} params Optional search parameters.
   * @return {Object}        Updated status.
  ###
  reset: (query = null, params = {}) ->
    @query = query
    @params = extend true, {}, @defaults, (@__fixParams params), page: 1
    # At least one request sent, to detect if 1st page requested
    @requestDone = false
    @lastPage = null

  #
  # Options
  #

  ###*
   * Proxy method to get options.
   * @return {http.ClientRequest}
   * @public
  ###
  options: (suffix, callback) ->
    @client.options suffix, callback

  #
  # Search
  #

  ###*
   * Performs a request for a new search (resets status).
   * Page will always be 1 in this case.
   *
   * @param  {String} query  Search terms.
   * @param  {Object} params Search parameters.
   * @return {http.ClientRequest}
   * @public
  ###
  search: (query, params = {}) ->
    @reset query, params
    @trigger "df:search"
    @getResults()

  ###*
   * Performs a request to get results for a specific page of the current
   * search. Requires a search being made via `search()` to set a status.
   *
   * @param  {Number} page
   * @return {http.ClientRequest|Boolean} The request or false if can't be made.
   * @public
  ###
  getPage: (page) ->
    page = parseInt page, 10
    if @requestDone and page <= @lastPage
      @params.page = page
      @trigger "df:getPage", [@query, @params]
      @getResults()
    else
      false

  ###*
   * Performs a request to get results for the next page of the current search,
   * if the last page was not already reached.
   *
   * @return {http.ClientRequest|Boolean} The request or false if can't be made.
   * @public
  ###
  getNextPage: ->
    @getPage @params.page + 1

  ###*
   * Gets the first page for the the current search again.
   *
   * @return {http.ClientRequest|Boolean} The request or false if can't be made.
   * @public
  ###
  refresh: ->
    @params.page = 1
    @trigger "df:refresh", [@query, @params]
    @getResults()

  ###*
   * Get results for the current search status.
   *
   * @return {http.ClientRequest}
   * @public
  ###
  getResults: ->
    @requestDone = true
    @params.query_counter = ++@queryCounter
    @params.query_name = null if @params.page is 1

    request = @client.search @query, @params, (err, res) =>
      if err
        @trigger "df:errorReceived", [err]
      else if res.query_counter is @params.query_counter
        @lastPage = Math.ceil (res.total / res.results_per_page)
        @params.query_name ?= res.query_name

        # TODO: Each widget could listen to its controller and render itself
        for widget in @widgets
          if res.page is 1 then widget.render res else widget.renderNext res

        @trigger "df:resultsReceived", [res]
        @trigger "df:lastPageReached", [res] if @isLastPage

  #
  # Events
  #

  on: (eventName, handler, args) ->
    bean.on @, eventName, handler, args

  one: (eventName, handler, args) ->
    bean.one @, eventName, handler, args

  off: (eventName, handler) ->
    bean.off @, eventName, handler

  trigger: (eventName, args) ->
    bean.fire @, eventName, args

  bind: (eventName, handler) ->
    @deprecate "`bind()` is deprecated, use `on()` instead"
    @on eventName, handler

  #
  # Widgets
  #

  addWidget: (widget) ->
    @widgets.push widget
    widget.init @

  #
  # Params
  #

  getParam: (key) ->
    @params[key]

  setParam: (key, value) ->
    @params[key] = value

  removeParam: (key, value) ->
    delete @params[key]

  addParam: (key, value) ->
    @deprecate "`addParam()` is deprecated, use `setParam()` instead"
    @setParam key, value

  #
  # Filters
  #

  ###*
   * Gets the value of a filter or undefined if not defined.
   *
   * @param  {String} key       Name of the filter.
   * @param  {String} paramName Name of the parameter ("filter" by default).
   * @return {*}
   * @public
  ###
  getFilter: (key, paramName = "filter") ->
    @params[paramName]?[key]

  ###*
   * Sets the value of a filter.
   *
   * @param  {String} key       Name of the filter.
   * @param  {*}      value     Value of the filter.
   * @param  {String} paramName Name of the parameter ("filter" by default).
   * @return {*}
   * @public
  ###
  setFilter: (key, value, paramName = "filter") ->
    @params[paramName] ?= {}
    @params[paramName][key] = if Thing.isStr value then [value] else value
    @params[paramName][key]

  ###*
   * Removes a value of a filter. If the filter is an array of strings, removes
   * the value inside the array. In any other case removes the entire value.
   *
   * @param  {String} key       Name of the filter.
   * @param  {*}      value     Value of the filter.
   * @param  {String} paramName Name of the parameter ("filter" by default).
   * @return {*}
   * @public
  ###
  removeFilter: (key, value, paramName = "filter") ->
    if @params[paramName]?[key]?
      if value? and Thing.isStrArray @params[paramName][key]
        pos = @params[paramName][key].indexOf value
        (@params[paramName][key].splice pos, 1) if pos >= 0
        if @params[paramName][key].length is 0
          delete @params[paramName][key]
      else
        delete @params[paramName][key]
      @params[paramName][key]

  ###*
   * Adds a value to a filter. If the value is a String, it's added
   * @param {[type]} key       [description]
   * @param {[type]} value     [description]
   * @param {[type]} paramName =             "filter" [description]
  ###
  addFilter: (key, value, paramName = "filter") ->
    @params[paramName] ?= {}
    @params[paramName][key] ?= []
    if Thing.isStrArray @params[paramName][key]
      if Thing.isStr value
        value = [value]
      if Thing.isStrArray value
        value = @params[paramName][key].concat value
    @setFilter key, value, paramName

  #
  # Exclusion Filters
  #

  getExclusion: (key) ->
    @getFilter key, "exclude"
  setExclusion: (key, value) ->
    @setFilter key, value, "exclude"
  removeExclusion: (key, value) ->
    @removeFilter key, value, "exclude"
  addExclusion: (key, value) ->
    @addFilter key, value, "exclude"

  #
  # Serialization
  #

  serializeStatus: (prefix = "#/search/") ->
    params = extend true, query: @query, @params
    delete params[key] for key in [
      'transformer',
      'rpp',
      'query_counter',
      'page'
    ]
    return "#{prefix}#{qs.stringify params}"

  loadStatus: (status, prefix = "#/search/") ->
    status = (qs.parse (status.replace prefix, "")) or {}

    @reset()

    @query = status.query or ""
    @params = extend true, @params, status
    @requestDone = true

    delete @params.query
    @refresh()


module.exports = Controller
