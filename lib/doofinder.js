(function() {
  module.exports = {
    version: "5.2.1",
    Client: require("./client"),
    Controller: require("./controller"),
    Stats: require("./stats"),
    Mustache: require("mustache"),
    widgets: {
      Widget: require("./widgets/widget"),
      QueryInput: require("./widgets/queryinput"),
      Display: require("./widgets/display"),
      ScrollDisplay: require("./widgets/scrolldisplay"),
      TermsFacet: require("./widgets/termsfacet"),
      RangeFacet: require("./widgets/rangefacet")
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
