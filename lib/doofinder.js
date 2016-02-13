(function() {
  module.exports = {
    version: "1.0.8",
    Client: require("./client"),
    Handlebars: require("mustache"),
    Widget: require("./widget"),
    Controller: require("./controller"),
    widgets: {
      Display: require("./widgets/display"),
      Results: require("./widgets/results/results"),
      ScrollResults: require("./widgets/results/scrollresults"),
      QueryInput: require("./widgets/queryinput"),
      TermFacet: require("./widgets/facets/termfacet"),
      RangeFacet: require("./widgets/facets/rangefacet")
    },
    jQuery: require("./util/jquery")
  };

}).call(this);
