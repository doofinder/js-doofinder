###*
 * Generates a UID of the given length.
 *
 * @param  {Number} length = 8  Length of the UID.
 * @return {String}             Unique ID as a String.
###
uniqueId = (length = 8) ->
  id = ""
  id += Math.random().toString(36).substr(2) while id.length < length
  id.substr 0, length


module.exports = uniqueId
