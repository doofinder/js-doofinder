jQuery = require "jquery"

if typeof(document) != 'undefined' # if we're on a real document
  require("./jquery.typewatch")(jQuery)

module.exports = jQuery
