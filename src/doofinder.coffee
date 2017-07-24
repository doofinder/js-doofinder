if not JSON.stringify and JSON.encode
  JSON.stringify = JSON.encode
if not JSON.parse and JSON.decode
  JSON.parse = JSON.decode

module.exports =
  version: "5.2.0"
  Client: require "./client"
  Mustache: require "mustache"
  Widget: require "./widget"
  Controller: require "./controller"
  widgets:
    Display: require "./widgets/display"
    Results: require "./widgets/results/results"
    ScrollResults: require "./widgets/results/scrollresults"
    QueryInput: require "./widgets/queryinput"
    BaseFacet: require "./widgets/facets/basefacet"
    TermFacet: require "./widgets/facets/termfacet"
    RangeFacet: require "./widgets/facets/rangefacet"
    FacetPanel: require "./widgets/facets/facetpanel"
  util:
    bean: require "bean"
    buildHelpers: require "./util/helpers"
    dfdom: require "./util/dfdom"
    extend: require "extend"
    http: require "./util/http"
    uniqueId: require "./util/uniqueid"
    introspection: require "./util/introspection"
    md5: require "md5"
    qs: require "qs"
    throttle: require "lodash.throttle"
  session: require "./session"
  stats: require "./stats"
