(function() {
  module.exports = {
    version: "0.6.1",
    Client: require("./client"),
    Widget: require("./widget"),
    widgets: {
      Results: require("./widgets/results/results"),
      ScrollResults: require("./widgets/results/scrollresults"),
      QueryInput: require("./widgets/queryinput")
    },
    Controller: require("./controller")
  };

}).call(this);
