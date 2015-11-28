(function() {
  var jQuery;

  jQuery = require("jquery");

  require("ion-rangeslider")(jQuery, document, window, navigator, void 0);

  require("./jquery.typewatch")(jQuery);

  require("./jquery.dfscroll")(jQuery);

  module.exports = jQuery;

}).call(this);
