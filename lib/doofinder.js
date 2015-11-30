(function() {
  module.exports = {
    version: "0.7.0",
    Client: require("./client"),
    Widget: require("./widget"),
    Controller: require("./controller"),
    widgets: {
      Results: require("./widgets/results/results"),
      ScrollResults: require("./widgets/results/scrollresults"),
      QueryInput: require("./widgets/queryinput"),
      TermFacet: require("./widgets/facets/termfacet"),
      RangeFacet: require("./widgets/facets/rangefacet")
    },
    jQuery: require("./util/jquery")
  };

}).call(this);
