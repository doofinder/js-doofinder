(function() {
  if (!JSON.stringify && JSON.encode) {
    JSON.stringify = JSON.encode;
  }

  if (!JSON.parse && JSON.decode) {
    JSON.parse = JSON.decode;
  }

  module.exports = {
    version: "4.1.28",
    Client: require("./client"),
    Mustache: require("mustache"),
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
    util: {
      md5: require("md5"),
      qs: require("qs"),
      bean: require("bean"),
      extend: require("extend"),
      introspection: require("./util/introspection"),
      dfdom: require("./util/dfdom"),
      throttle: require("./util/throttle"),
      http: require("./util/http")
    }
  };

}).call(this);
