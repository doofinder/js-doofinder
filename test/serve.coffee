nock = require "nock"
extend = require "extend"
deepEqual = require "deep-eql"

cfg = require "./config"

module.exports =
  nock: nock

  clean: ->
    nock.cleanAll()

  request: (code = 200, text = '{}') ->
    ((nock cfg.address).get "/somewhere").reply code, text

  requestError: (error) ->
    ((nock cfg.address).get "/somewhere").replyWithError error

  options: (suffix) ->
    resource = "/#{cfg.version}/options/#{cfg.hashid}"
    resource = "#{resource}?#{suffix}" if suffix?
    ((nock cfg.address).get resource).reply 200, "{}"

  search: (params, response = {}) ->
    resource = "/#{cfg.version}/search"
    defaultParams =
      hashid: cfg.hashid
      query: ''
      # page: 1  # Doofinder assumes this by default
      # rpp: 10  # Doofinder assumes this by default
    params = extend true, defaultParams, (params or {})
    response.results_per_page = params.rpp or 10
    response.query_counter = params.query_counter
    (((nock cfg.address).get resource).query params).reply 200, (JSON.stringify response)

  forbidden: ->
    resource = "/#{cfg.version}/search"
    response =
      error: "request not authenticated"
    checkParams = -> true
    (((nock cfg.address).get resource).query checkParams).reply 403, (JSON.stringify response)

  stats: (type, params) ->
    resource = "/#{cfg.version}/stats/#{type}"
    defaultParams =
      hashid: cfg.hashid
      random: 0
    params = extend true, defaultParams, (params or {})
    checkParams = (actualParams) ->
      # random comes with, well, a random value so we alter it to make the
      # request match the expected parameters.
      actualParams.random = 0
      # the request matches if expected params are the same as received params.
      deepEqual params, actualParams
    (((nock cfg.address).get resource).query checkParams).reply 200, '"OK"'
