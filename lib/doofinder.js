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
      addHelpers: require("./util/helpers"),
      bean: require("bean"),
      currency: require("./util/currency"),
      Debouncer: require("./util/debouncer"),
      dfdom: require("./util/dfdom"),
      extend: require("extend"),
      http: require("./util/http"),
      md5: require("md5"),
      qs: require("qs"),
      uniqueId: require("./util/uniqueid"),
      text: require("./util/text")
    },
    session: require("./session")
  };

}).call(this);
