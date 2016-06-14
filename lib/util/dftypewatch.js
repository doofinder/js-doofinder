(function() {
  var dfTypeWatch, extend;

  extend = require('./extend');

  dfTypeWatch = function(input, options) {
    var _supportedInputTypes, checkElement, defaults, watchElement;
    _supportedInputTypes = ['TEXT', 'TEXTAREA', 'PASSWORD', 'TEL', 'SEARCH', 'URL', 'EMAIL', 'DATETIME', 'DATE', 'MONTH', 'WEEK', 'TIME', 'DATETIME-LOCAL', 'NUMBER', 'RANGE'];
    defaults = {
      wait: 750,
      callback: function() {},
      highlight: true,
      captureLength: 2,
      inputTypes: _supportedInputTypes
    };
    options = extend(true, {}, defaults, options);
    checkElement = function(timer, override) {
      var value;
      value = timer.el.value || '';
      if (value.length >= options.captureLength && value.toUpperCase() !== timer.text || override && value.length >= options.captureLength || value.length === 0 && timer.text) {
        timer.text = value.toUpperCase();
        return timer.cb.call(timer.el, value);
      }
    };
    watchElement = function(elem) {
      var elementType, startWatch, timer, value;
      elementType = elem.getAttribute('type').toUpperCase();
      value = elem.value || '';
      if (options.inputTypes.indexOf(elementType) >= 0) {
        timer = {
          timer: null,
          text: value,
          cb: options.callback,
          wait: options.wait,
          el: elem
        };
        startWatch = function(evt) {
          var evtElementType, overrideBool, timerCallbackFx, timerWait;
          timerWait = timer.wait;
          overrideBool = false;
          evtElementType = this.type.toUpperCase();
          if (typeof evt.keyCode !== 'undefined' && evt.keyCode === 13 && evtElementType !== 'TEXTAREA' && options.inputTypes.indexOf(evtElementType) >= 0) {
            timerWait = 1;
            overrideBool = true;
          }
          timerCallbackFx = function() {
            return checkElement(timer, overrideBool);
          };
          clearTimeout(timer.timer);
          return timer.timer = setTimeout(timerCallbackFx, timerWait);
        };
        elem.addEventListener('keydown', startWatch);
        elem.addEventListener('paste', startWatch);
        elem.addEventListener('cut', startWatch);
        elem.addEventListener('input', startWatch);
        return elem.addEventListener('change', startWatch);
      }
    };
    return watchElement(document.querySelector(input));
  };

  module.exports = dfTypeWatch;

}).call(this);
