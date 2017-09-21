(function() {
  if (!JSON.stringify && JSON.encode) {
    JSON.stringify = JSON.encode;
  }

  if (!JSON.parse && JSON.decode) {
    JSON.parse = JSON.decode;
  }

  module.exports = {
    version: "5.2.0",
    Client: require("./client"),
    Mustache: require("mustache"),
    Controller: require("./controller"),
    widgets: {
      Widget: require("./widgets/widget"),
      Display: require("./widgets/display"),
      ScrollDisplay: require("./widgets/scrolldisplay"),
      QueryInput: require("./widgets/queryinput"),
      BaseFacet: require("./widgets/facets/basefacet"),
      TermsFacet: require("./widgets/facets/termfacet"),
      RangeFacet: require("./widgets/facets/rangefacet"),
      FacetPanel: require("./widgets/facets/facetpanel")
    },
    util: {
      bean: require("bean"),
      buildHelpers: require("./util/helpers"),
      dfdom: require("./util/dfdom"),
      extend: require("extend"),
      http: require("./util/http"),
      uniqueId: require("./util/uniqueid"),
      md5: require("md5"),
      qs: require("qs"),
      throttle: require("lodash.throttle")
    },
    session: require("./session"),
    stats: require("./stats")
  };

}).call(this);
