jQuery = require "jquery"

if typeof(document) != 'undefined' # if we're on a real document
  require("ion-rangeslider")(jQuery, document, window, navigator, undefined)
  require("./jquery.typewatch")(jQuery)

module.exports = jQuery
