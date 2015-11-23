(function() {
  module.exports = {
    version: "0.6.0",
    Client: require("./client"),
    Widget: require("./widget"),
    ScrollWidget: require("./widgets/scrollwidget"),
    InfiniteScrollWidget: require("./widgets/infinitescrollwidget"),
    QueryInputWidget: require("./widgets/queryinputwidget"),
    Controller: require("./controller")
  };

}).call(this);
