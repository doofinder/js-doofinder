
/**
 * Generates a UID of the given length.
 *
 * @param  {Number} length = 8  Length of the UID.
 * @return {String}             Unique ID as a String.
 */

(function() {
  var uniqueId;

  uniqueId = function(length) {
    var id;
    if (length == null) {
      length = 8;
    }
    id = "";
    while (id.length < length) {
      id += Math.random().toString(36).substr(2);
    }
    return id.substr(0, length);
  };

  module.exports = uniqueId;

}).call(this);
