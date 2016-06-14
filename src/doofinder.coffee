if not JSON.stringify and JSON.encode
    JSON.stringify = JSON.encode
if not JSON.parse and JSON.decode
    JSON.parse = JSON.decode

module.exports =
  version: "3.2.2"
  Client: require "./client"
  Mustache: require "mustache"
  Widget: require "./widget"
  Controller: require "./controller"
  widgets:
    Display: require "./widgets/display"
    Results: require "./widgets/results/results"
    ScrollResults: require "./widgets/results/scrollresults"
    QueryInput: require "./widgets/queryinput"
    TermFacet: require "./widgets/facets/termfacet"
    RangeFacet: require "./widgets/facets/rangefacet"
  md5: require "md5"
  qs: require "qs"
