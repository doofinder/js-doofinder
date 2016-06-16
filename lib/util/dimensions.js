(function() {
  var calculateDimension, clientHeight, clientWidth;

  calculateDimension = function(name, elem) {
    var doc;
    if (elem.nodeType === 9) {
      doc = elem.documentElement;
      return Math.max(elem.body["scroll" + name], doc["scroll" + name], elem.body["offset" + name], doc["offset" + name], doc["client" + name]);
    } else {
      return elem["client" + name];
    }
  };

  clientWidth = function(elem) {
    return calculateDimension("Width", elem);
  };

  clientHeight = function(elem) {
    return calculateDimension("Height", elem);
  };

  module.exports = {
    clientWidth: clientWidth,
    clientHeight: clientHeight
  };

}).call(this);
