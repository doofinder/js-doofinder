(function() {
  var Thing, freeze, freezeProperty;

  Thing = require("./thing");


  /**
   * Recursively freezes an object so it can't be modified in any way (adding or
   * removing properties, and so on).
   *
   * @param  {*} value Any object or primitive
   * @return {*}       Freezed value.
   */

  freeze = function(value) {
    (Object.getOwnPropertyNames(value)).forEach(function(propertyName) {
      if ((Thing.isObj(value)) && (value[propertyName] !== null) && !(Object.isFrozen(value[propertyName]))) {
        return freeze(value[propertyName]);
      }
    });
    Object.freeze(value);
    return value;
  };


  /**
   * Freezes a property of an Object so it can't be modified.
   *
   * @param  {Object} instance      An object's instance.
   * @param  {String} propertyName  A property name.
   * @param  {*}      propertyValue An optional value. If not set the current
   *                                value is used.
   * @return {Object}               The passed instance.
   */

  freezeProperty = function(instance, propertyName, propertyValue) {
    var descriptor;
    if (propertyValue == null) {
      propertyValue = instance[propertyName];
    }
    descriptor = {
      value: propertyValue,
      configurable: false,
      enumerable: false,
      writable: false
    };
    freeze(propertyValue);
    Object.defineProperty(instance, propertyName, descriptor);
    return instance;
  };

  module.exports = {
    freeze: freeze,
    freezeProperty: freezeProperty
  };

}).call(this);
