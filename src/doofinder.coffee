module.exports = 
  version: "0.17.9"  
  Client: require "./client"
  Handlebars: require "handlebars"
  Widget: require "./widget"
  Controller: require "./controller"
  widgets:
    Display: require "./widgets/display"
    Results: require "./widgets/results/results"
    ScrollResults: require "./widgets/results/scrollresults"
    QueryInput: require "./widgets/queryinput"
    TermFacet: require "./widgets/facets/termfacet"
    RangeFacet: require "./widgets/facets/rangefacet"
  jQuery: require "./util/jquery"