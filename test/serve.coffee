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

  search: (params = {}, response = {}) ->
    resource = "/#{cfg.version}/search"

    params.hashid ?= cfg.hashid

    # forward params from request to response
    for field in ['hashid', 'query', 'page', 'query_counter', 'query_name', 'rpp']
      response[field] ?= params[field] if params[field]?

    if response.rpp?
      response.results_per_page ?= response.rpp
      delete response.rpp

    (((nock cfg.address).get resource).query params).reply 200, (JSON.stringify response)

  forbidden: ->
    resource = "/#{cfg.version}/search"
    response =
      error: "request not authenticated"
    checkParams = -> true
    (((nock cfg.address).get resource).query checkParams).reply 403, (JSON.stringify response)

  stats: (type, params) ->
    resource = "/#{cfg.version}/stats/#{type}"
    params = extend true, hashid: cfg.hashid, (params or {}), (random: 0)
    checkParams = (actualParams) ->
      # random comes with, well, a random value so we alter it to make the
      # request match the expected parameters.
      actualParams.random = 0
      # the request matches if expected params are the same as received params.
      deepEqual params, actualParams
    (((nock cfg.address).get resource).query checkParams).reply 200, '"OK"'
