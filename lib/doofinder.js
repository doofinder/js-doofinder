(function() {
  module.exports = {
    version: "5.12.2",
    Client: require("./client"),
    Controller: require("./controller"),
    Stats: require("./stats"),
    Mustache: require("mustache"),
    widgets: {
      Widget: require("./widgets/widget"),
      QueryInput: require("./widgets/queryinput"),
      Pager: require("./widgets/pager"),
      Display: require("./widgets/display"),
      ScrollDisplay: require("./widgets/scrolldisplay"),
      TermsFacet: require("./widgets/termsfacet"),
      RangeFacet: require("./widgets/rangefacet")
    },
    util: {
      bean: require("bean"),
      dfdom: require("./util/dfdom"),
      errors: require("./util/errors"),
      EventEnabled: require("./util/eventEnabled"),
      helpers: require("./util/helpers"),
      http: require("./util/http"),
      md5: require("md5"),
      merge: require("./util/merge"),
      qs: require("qs"),
      ScrollManager: require("./util/scrollManager"),
      text: require("./util/text"),
      Thing: require("./util/thing"),
      throttle: require("lodash.throttle"),
      uniqueId: require("./util/uniqueid")
    },
    session: require("./session")
  };

}).call(this);
