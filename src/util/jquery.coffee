jQuery = require "jquery"

if not document
	document = null
if not window
	window = null
if not navigator
	navigator = null

if document and window and navigator
	require("ion-rangeslider")(jQuery, document, window, navigator, undefined)
	require("./jquery.typewatch")(jQuery)

module.exports = jQuery