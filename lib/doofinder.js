(function() {
  module.exports = {
    version: "0.5.4",
    Client: require("./client"),
    Displayer: require("./displayer"),
    ScrollDisplayer: require("./displayers/scrolldisplayer"),
    StaticDisplayer: require("./displayers/staticdisplayer"),
    InfiniteScrollWidget: require("./widgets/infinitescrollwidget"),
    QueryInputWidget: require("./widgets/queryinputwidget"),
    Controller: require("./controller")
  };

}).call(this);
