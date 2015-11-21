(function() {
  module.exports = {
    version: "0.5.4",
    Client: require("./client"),
    Displayer: require("./displayer"),
    ScrollDisplayer: require("./scrolldisplayer"),
    StaticDisplayer: require("./staticdisplayer"),
    InfiniteScrollWidget: require("./infinitescrollwidget"),
    QueryInputWidget: require("./queryinputwidget"),
    Controller: require("./controller")
  };

}).call(this);
