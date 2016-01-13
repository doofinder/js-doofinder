(function() {
  var document, jQuery, navigator, window;

  jQuery = require("jquery");

  if (!document) {
    document = null;
  }

  if (!window) {
    window = null;
  }

  if (!navigator) {
    navigator = null;
  }

  if (document && window && navigator) {
    require("ion-rangeslider")(jQuery, document, window, navigator, void 0);
    require("./jquery.typewatch")(jQuery);
  }

  module.exports = jQuery;

}).call(this);
