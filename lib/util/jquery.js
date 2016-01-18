(function() {
  var jQuery;

  jQuery = require("jquery");

  if (typeof document !== 'undefined') {
    require("ion-rangeslider")(jQuery, document, window, navigator, void 0);
    require("./jquery.typewatch")(jQuery);
  }

  module.exports = jQuery;

}).call(this);
