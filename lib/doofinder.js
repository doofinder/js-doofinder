(function() {
  module.exports = {
    version: "5.2.0",
    Client: require("./client"),
    Controller: require("./controller"),
    Stats: require("./stats"),
    Mustache: require("mustache"),
    widgets: {
      CollapsiblePanel: require("./widgets/collapsiblepanel"),
      Display: require("./widgets/display"),
      Panel: require("./widgets/panel"),
      QueryInput: require("./widgets/queryinput"),
      RangeFacet: require("./widgets/facets/rangefacet"),
      ScrollDisplay: require("./widgets/scrolldisplay"),
      TermsFacet: require("./widgets/facets/termsfacet"),
      Widget: require("./widgets/widget")
    },
    util: {
      bean: require("bean"),
      dfdom: require("./util/dfdom"),
      errors: require("./util/errors"),
      extend: require("extend"),
      helpers: require("./util/helpers"),
      http: require("./util/http"),
      md5: require("md5"),
      qs: require("qs"),
      text: require("./util/text"),
      Thing: require("./util/thing"),
      throttle: require("lodash.throttle"),
      uniqueId: require("./util/uniqueid")
    },
    session: require("./session")
  };

}).call(this);
