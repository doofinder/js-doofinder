qs = require "qs"

Client = require "./client"
errors = require "./util/errors"
EventEnabled = require "./util/eventEnabled"
Freezer = require "./util/freezer"
merge = require "./util/merge"
Thing = require "./util/thing"
Widget = require "./widgets/widget"

###
Controller

This class uses the client to
to retrieve the data and the widgets
to paint them.
###
class Controller extends EventEnabled
  constructor: (@client, defaultParams = {}) ->
    unless @client instanceof Client
      throw (errors.error "client must be an instance of Client", @)

    unless Thing.is.plainObject defaultParams
      throw (errors.error "defaultParams must be an instance of Object", @)

    # controller needs page and rpp to do calculations
    defaults =
      page: 1
      rpp: 10

    @defaults = merge defaults, defaultParams
    @queryCounter = 0

    @widgets = []
    @processors = []

    Object.defineProperty @, 'hashid', get: ->
      @client.hashid

    Object.defineProperty @, 'isFirstPage', get: ->
      @requestDone and @params.page is 1

    Object.defineProperty @, 'isLastPage', get: ->
      @requestDone and @params.page is @lastPage

    @reset()

  #
  # Status
  #

  ###*
   * Resets status and optionally forces query and params. As it is a reset
   * aimed to perform a new search.
   *
   * @param  {String} query  Search terms.
   * @param  {Object} params Optional search parameters.
   * @param  {Object} items to search using getItems method
   * @return {Object}        Updated status.
  ###
  reset: (query = null, params = {}, items = []) ->
    @query = query
    @params = merge page: 1, @defaults, params
    @items = items
    # At least one request sent, to detect if 1st page requested
    @requestDone = false
    @lastPage = null

  ###*
   * Resets status and clean widgets at the same time.
   * @public
  ###
  clean: ->
    @reset()
    @cleanWidgets()

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
    @__doSearch()
    @trigger "df:search", [@query, @params]

  ###*
   * Performs a get items request.
   * Page will always be 1 in this case.
   *
   * @param  {Object} dfid list to get.
   * @param  {Object} params Search parameters.
   * @return {http.ClientRequest}
   * @public
  ###
  getItems: (items, params = {}) ->
    @reset null, params, items
    @__doSearch()
    @trigger "df:search", [@query, @params]

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
      @__doSearch()
      @trigger "df:search:page", [@query, @params]

  ###*
   * Performs a request to get results for the next page of the current search,
   * if the last page was not already reached.
   *
   * @return {http.ClientRequest|Boolean} The request or false if can't be made.
   * @public
  ###
  getNextPage: ->
    @getPage (@params.page or 1) + 1

  ###*
   * Gets the first page for the the current search again.
   *
   * @return {http.ClientRequest|Boolean} The request or false if can't be made.
   * @public
  ###
  refresh: ->
    @__doSearch()
    @trigger "df:refresh", [@query, @params]

  ###*
   * Get results for the current search status.
   *
   * @return {http.ClientRequest}
   * @protected
  ###
  __doSearch: ->
    @requestDone = true
    params = merge query_counter: ++@queryCounter, @params

    __getResults = (err, response) =>
      if err
        @trigger "df:results:error", [err]

      else if response.query_counter == @queryCounter
        @lastPage = Math.ceil (response.total / response.results_per_page)
        @params.query_name = response.query_name

        @processResponse response
        @renderWidgets response

        @trigger "df:results:success", [response]
        @trigger "df:results:end", [response] if @isLastPage

      else
        @trigger "df:results:discarded", [response]

    if @items.length > 0
      request = @client.getItems @items, params, __getResults
    else
      request = @client.search @query, params, __getResults

  ###*
   * Transform the response by passing it through a set of data processors,
   * if any.
   *
   * @param  {Object} response Search response.
   * @return {Object}          The resulting search response.
  ###
  processResponse: (response) ->
    @processors.reduce ((data, fn) -> fn data), response

  #
  # Widgets
  #

  ###*
   * Registers a widget in the current controller instance.
   *
   * @param  {Widget} widget  An instance of Widget (or any of its subclasses).
   * @public
  ###
  registerWidget: (widget) ->
    unless widget instanceof Widget
      throw (errors.error "widget must be an instance of Widget", @)
    widget.setController @
    widget.init()
    @widgets.push widget

  ###*
   * Registers multiple widgets at the same time in the current controller
   * instance.
   *
   * @param  {Array} widgets  An array of Widget instances.
   * @public
  ###
  registerWidgets: (widgets) ->
    (@registerWidget widget) for widget in widgets

  ###*
   * Makes registered widgets render themselves with the provided search
   * response.
   *
   * Triggers an event when all widgets' `render()` method have been executed.
   *
   * @param {Object} res A search response.
   * @fires Controller#df:controller:renderWidgets
   * @public
  ###
  renderWidgets: (res) ->
    @widgets.forEach (widget) ->
      try
        widget.render res
      catch err
        errors.warning """Couldn't render #{widget} widget due to an error:

#{err.stack}

Refresh your browser's cache and try again. If the error persists contact support."""
        widget.clean()
    @trigger "df:controller:renderWidgets"

  ###*
   * Makes registered widgets clean themselves.
   *
   * Triggers an event when all widgets' `clean()` method have been executed.
   *
   * @fires Controller#df:controller:cleanWidgets
   * @public
  ###
  cleanWidgets: ->
    @widgets.forEach (widget) ->
      widget.clean()
    @trigger "df:controller:cleanWidgets"

  #
  # Params
  #

  ###*
   * Returns the value of a search parameter.
   *
   * @param  {String} key
   * @return {*}
   * @public
  ###
  getParam: (key) ->
    @params[key]

  ###*
   * Sets the value of a search parameter.
   *
   * @param {string}  key
   * @param {*}       value
   * @public
  ###
  setParam: (key, value) ->
    @params[key] = value

  ###*
   * Removes a search parameter.
   *
   * @param  {String} key
   * @public
  ###
  removeParam: (key) ->
    delete @params[key]

  #
  # Filters
  #

  ###*
   * Gets the value of a filter
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
   * String values are stored inside an array for the given key.
   *
   * @param  {String} key       Name of the filter.
   * @param  {*}      value     Value of the filter.
   * @param  {String} paramName Name of the parameter ("filter" by default).
   * @return {*}
   * @public
  ###
  setFilter: (key, value, paramName = "filter") ->
    @params[paramName] ?= {}
    @params[paramName][key] = if Thing.is.string value then [value] else value
    @params[paramName][key]

  ###*
   * Adds a value to a filter.
   *
   * @param {String}  key       Name of the filter.
   * @param {*}       value     Value to be added.
   * @param {String}  paramName = "filter"
  ###
  addFilter: (key, value, paramName = "filter") ->
    @params[paramName] ?= {}
    if Thing.is.array @params[paramName][key]
      if Thing.is.array value
        # adding an array to an array concats both without duplicates
        @params[paramName][key] = @params[paramName][key].concat (value.filter (x, i, arr) =>
          (@params[paramName][key].indexOf x) < 0
        )
      else
        # otherwise, the value is appended at the end of the array
        @params[paramName][key].push value unless (@params[paramName][key].indexOf value) >= 0
    else if (Thing.is.plainObject @params[paramName][key]) and (Thing.is.plainObject value)
      # adding a hash to a hash filter extends it, taking care of the
      # nitty-gritty of range filters
      @params[paramName][key] = @__buildHashFilter @params[paramName][key], value
    else
      # any other case just replaces the existing filter
      @setFilter key, value, paramName

  ###*
   * Removes a value from a filter.
   *
   * - If values are stored in an array:
   *   - If a single value is passed, removes it from the array, if exists.
   *   - If an array is passed, removes as much values as it can from the array.
   *   - Passing an object is a wrong use case, don't do it.
   * - If values are stored in a plain Object:
   *   - If a single value is passed, it is considered a key of the filter, so
   *     direct removal is tried.
   *   - If a plain Object is passed as a value, removes as much keys as it can
   *     from the filter.
   *   - Passing an array is a wrong use case, don't do it.
   * - If no value is passed, the entire filter is removed.
   * - In any other case, if the value matches the value of the filter, the
   *   entire filter is removed.
   *
   * @param  {String} key       Name of the filter.
   * @param  {*}      value     Value of the filter.
   * @param  {String} paramName Name of the parameter ("filter" by default).
   * @return {*}
   * @public
  ###
  removeFilter: (key, value, paramName = "filter") ->
    # remove only if filter exists
    if @params[paramName]?[key]?
      unless value?
        # delete the entire filter if no specific value received
        delete @params[paramName][key]
      else if Thing.is.array @params[paramName][key]
        # if filter contains an array
        if not Thing.is.array value
          value = [value]

        # preserve values not present in the values-to-remove array
        @params[paramName][key] = @params[paramName][key].filter (x, i, arr) ->
          (value.indexOf x) < 0

        # if no item remaining in the filter, remove the key
        if @params[paramName][key].length is 0
          delete @params[paramName][key]
      else if Thing.is.plainObject @params[paramName][key]
        # if the filter is a plain object
        if not Thing.is.plainObject value
          # if value is a scalar, string... means it's a key so we remove it
          # directly
          delete @params[paramName][key][value]
        else
          # If it is a hash, remove common keys from the filter
          for x in (Object.keys value)
            delete @params[paramName][key][x]

        # If the filter has no remaining keys, remove the key
        if not (Object.keys @params[paramName][key]).length
          delete @params[paramName][key]

      else if @params[paramName][key] == value
        # if value of the filter matches passed value, delete the key
        delete @params[paramName][key]

      @params[paramName][key]

  ###*
   * Fixes filters in case they're range filters so there are no conflicts
   * between filter properties (for instance, "gt" and "gte" being used in the
   * same filter).
   *
   * @protected
   * @param  {Object} currentFilter
   * @param  {Object} newFilter
   * @return {Object}
  ###
  __buildHashFilter: (currentFilter = {}, newFilter = {}) ->
    value = merge {}, currentFilter
    if newFilter.gt? or newFilter.gte?
      delete value.gt
      delete value.gte
    if newFilter.lt? or newFilter.lte?
      delete value.lt
      delete value.lte
    merge value, newFilter

  #
  # Exclusion Filters (see regular filters documentation)
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

  ###*
   * Returns the current status of the controller as a URL querystring.
   *
   * Useful to save it somewhere and recover later.
   *
   * @return {String}
   * @public
  ###
  serializeStatus: (include=[]) ->
    status = merge query: @query, @params

    ignored_keys = [
      'transformer',
      'rpp',
      'query_counter',
      'page'
    ].filter (x) -> include.indexOf(x) < 0

    delete status[key] for key in ignored_keys

    delete status[key] for own key, value of status when not value

    if (Object.keys status).length > 0
      qs.stringify status
    else
      ""

  ###*
   * Changes the status of the controller based on the value of the status
   * parameter.
   *
   * @param  {String} status  Status previously obtained with `serializeStatus`.
   * @return {Object|Boolean} Status parameters as an Object or `false` if
   *                          status could not be recovered.
  ###
  loadStatus: (status) ->
    params = (qs.parse status) or {}

    if (Object.keys params).length > 0
      requestParams = merge {}, params
      query = requestParams.query or ""
      delete requestParams.query

      @reset query, requestParams
      @requestDone = true
      @refresh()
      params
    else
      false


module.exports = Controller
