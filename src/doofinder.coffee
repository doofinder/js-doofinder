if not JSON.stringify and JSON.encode
  JSON.stringify = JSON.encode
if not JSON.parse and JSON.decode
  JSON.parse = JSON.decode

module.exports =
  version: "5.2.0"
  Client: require "./client"
  Mustache: require "mustache"
  Controller: require "./controller"
  widgets:
    Widget: require "./widgets/widget"
    Display: require "./widgets/display"
    ScrollDisplay: require "./widgets/scrolldisplay"
    QueryInput: require "./widgets/queryinput"
    BaseFacet: require "./widgets/facets/basefacet"
    TermsFacet: require "./widgets/facets/termfacet"
    RangeFacet: require "./widgets/facets/rangefacet"
    Panel: require "./widgets/panel"
    CollapsiblePanel: require "./widgets/collapsiblepanel"
  util:
    bean: require "bean"
    buildHelpers: require "./util/helpers"
    dfdom: require "./util/dfdom"
    extend: require "extend"
    http: require "./util/http"
    uniqueId: require "./util/uniqueid"
    md5: require "md5"
    qs: require "qs"
    throttle: require "lodash.throttle"
  session: require "./session"
  stats: require "./stats"
