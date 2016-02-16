(function() {
  var document, jQuery, navigator, window;

  jQuery = require("jquery");

  if (typeof document === 'undefined') {
    document = require("jsdom").jsdom('<input id="query"></input>');
    window = document.defaultView;
    navigator = window.navigator = {};
    navigator.userAgent = 'Nasty Navigator';
    navigator.appVersion = '0.0.1';
    jQuery = jQuery(window);
  }

  require("ion-rangeslider")(jQuery, document, window, navigator, void 0);

  require("./jquery.typewatch")(jQuery);

  module.exports = jQuery;

}).call(this);
