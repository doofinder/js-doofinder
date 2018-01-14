bean = require "bean"
extend = require "extend"
qs = require "qs"

errors = require "./util/errors"
Client = require "./client"
Widget = require "./widgets/widget"

Freezer = require "./util/freezer"
Thing = require "./util/thing"

###
Controller

This class uses the client to
to retrieve the data and the widgets
to paint them.
###
class Controller
  constructor: (@client, defaultParams = {}) ->
    unless @client instanceof Client
      throw (errors.error "client must be an instance of Client", @)

    unless Thing.is.hash defaultParams
      throw (errors.error "defaultParams must be an instance of Object", @)

    # controller needs page and rpp to do calculations
    defaults =
      page: 1
      rpp: 10

    @defaults = extend true, defaults, (@__fixParams defaultParams)
    @queryCounter = 0

    @widgets = []

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
      errors.warning "`filters` key is deprecated for search parameters, use `filter` instead", @
    params

  ###*
   * Resets status and optionally forces query and params. As it is a reset
   * aimed to perform a new search, page is forced to 1 in any case.
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
    @__getResults()
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
      @__getResults()
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
    @params.page = 1
    @__getResults()
    @trigger "df:refresh", [@query, @params]

  ###*
   * Get results for the current search status.
   *
   * @return {http.ClientRequest}
   * @protected
  ###
  __getResults: ->
    @requestDone = true
    params = extend true, query_counter: ++@queryCounter, @params
    request = @client.search @query, params, (err, res) =>
      if err
        @trigger "df:results:error", [err]
        @trigger "df:error_received", [err] # DEPRECATED
      else
        @lastPage = Math.ceil (res.total / res.results_per_page)
        @params.query_name = res.query_name

        @renderWidgets res

        @trigger "df:results:success", [res]
        @trigger "df:results_received", [res] # DEPRECATED

        @trigger "df:results:end", [res] if @isLastPage

  #
  # Events
  #

  on: (eventName, handler) ->
    bean.on @, eventName, handler

  one: (eventName, handler) ->
    bean.one @, eventName, handler

  off: (eventName, handler) ->
    bean.off @, eventName, handler

  trigger: (eventName, args) ->
    bean.fire @, eventName, args

  bind: (eventName, handler) ->
    errors.warning "`bind()` is deprecated, use `on()` instead", @
    @on eventName, handler

  #
  # Widgets
  #

  registerWidget: (widget) ->
    unless widget instanceof Widget
      throw (errors.error "widget must be an instance of Widget", @)
    widget.setController @
    widget.init()
    @widgets.push widget

  registerWidgets: (widgets) ->
    (@registerWidget widget) for widget in widgets

  renderWidgets: (res) ->
    @widgets.forEach (widget) ->
      widget.render res
    @trigger "df:controller:renderWidgets"

  cleanWidgets: ->
    @widgets.forEach (widget) ->
      widget.clean()
    @trigger "df:controller:cleanWidgets"

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
    errors.warning "`addParam()` is deprecated, use `setParam()` instead", @
    @setParam key, value

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
   * Removes a value from a filter.
   *
   * - If values are stored in an array:
   *   - If a single value is passed, removes it from the array, if exists.
   *   - If an array is passed, removes as much values as it can from the array.
   * - If values are stored in a plain Object:
   *   - If a single value is passed, it is considered a key of the filter, so
   *     direct removal is tried.
   *   - If a plain Object is passed as a value, removes as much keys as it can
   *     from the filter.
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
      else if Thing.is.hash @params[paramName][key]
        # if the filter is a plain object
        if not Thing.is.hash value
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
        # adding an array to an array concats both
        @params[paramName][key] = @params[paramName][key].concat value
      else
        # otherwise, the value is appended at the end of the array
        @params[paramName][key].push value
    else if (Thing.is.hash @params[paramName][key]) and (Thing.is.hash value)
      # adding a hash to a hash filter extends it, taking care of the
      # nitty-gritty of range filters
      @params[paramName][key] = @__buildHashFilter @params[paramName][key], value
    else
      # any other case just replaces the existing filter
      @setFilter key, value, paramName

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
    value = extend true, {}, currentFilter
    if newFilter.gt? or newFilter.gte?
      delete value.gt
      delete value.gte
    if newFilter.lt? or newFilter.lte?
      delete value.lt
      delete value.lte
    extend true, value, newFilter

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

  serializeStatus: ->
    status = extend true, query: @query, @params
    delete status[key] for key in [
      'transformer',
      'rpp',
      'query_counter',
      'page'
    ]

    delete status[key] for own key, value of status when not value

    if (Object.keys status).length > 0
      qs.stringify status
    else
      ""

  loadStatus: (status) ->
    params = (qs.parse status) or {}

    if (Object.keys params).length > 0
      requestParams = extend true, {}, params
      query = requestParams.query or ""
      delete requestParams.query

      @reset query, requestParams
      @requestDone = true
      @refresh()
      params
    else
      false


module.exports = Controller
