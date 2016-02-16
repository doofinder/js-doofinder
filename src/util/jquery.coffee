jQuery = require "jquery"

if typeof(document) == 'undefined' # test environment
  document = require("jsdom").jsdom('<input id="query"></input>')
  window = document.defaultView
  navigator = window.navigator = {}
  navigator.userAgent = 'Nasty Navigator' # kudos to @jesusenlanet
  navigator.appVersion = '0.0.1'
  jQuery = jQuery(window)

require("ion-rangeslider")(jQuery, document, window, navigator, undefined)
require("./jquery.typewatch")(jQuery)

module.exports = jQuery
