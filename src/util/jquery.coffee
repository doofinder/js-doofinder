jQuery = require "jquery"

if typeof(document) != 'undefined'
  require("ion-rangeslider")(jQuery, document, window, navigator, undefined)
  require("./jquery.typewatch")(jQuery)

module.exports = jQuery