(function() {
  var jQuery;

  jQuery = require("jquery");

  if (typeof document !== 'undefined') {
    require("./jquery.typewatch")(jQuery);
  }

  module.exports = jQuery;

}).call(this);
