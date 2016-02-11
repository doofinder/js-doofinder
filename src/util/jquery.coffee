jQuery = require "jquery"
jsdom = require "jsdom"

if typeof window == 'undefined'
  # node.js
  document = jsdom.jsdom('<input id="query"></input>')
  window = document.defaultView
  navigator = window.navigator = {}
  navigator.userAgent = 'Nasty Navigator';
  navigator.appVersion = '0.0.1'
  $ = jQuery= require('jquery')(window)

if typeof(document) != 'undefined'
  require("ion-rangeslider")(jQuery, document, window, navigator, undefined)
  require("./jquery.typewatch")(jQuery)

module.exports = jQuery
