(function() {
  var $, extend,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  extend = require('extend');

  $ = require('./dfdom');

  module.exports = function(element, options) {
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
      value = timer.el.val() || '';
      if (value.length >= options.captureLength && value.toUpperCase() !== timer.text || override && value.length >= options.captureLength || value.length === 0 && timer.text) {
        timer.text = value.toUpperCase();
        return timer.cb.call(timer.el, value);
      }
    };
    watchElement = function(elem) {
      var inputType, ref, timer;
      inputType = elem.attr('type');
      if (!inputType) {
        inputType = 'text';
      }
      if (ref = inputType.toUpperCase(), indexOf.call(options.inputTypes, ref) >= 0) {
        timer = {
          timer: null,
          text: elem.value || '',
          cb: options.callback,
          wait: options.wait,
          el: elem
        };
        return elem.on('keydown paste cut input change', function(e) {
          var delay, override, timerCallbackFx;
          delay = timer.wait;
          override = false;
          inputType = this.type.toUpperCase();
          if ((e.keyCode != null) && e.keyCode === 13 && inputType !== 'TEXTAREA' && indexOf.call(options.inputTypes, inputType) >= 0) {
            delay = 1;
            override = true;
          }
          timerCallbackFx = function() {
            return checkElement(timer, override);
          };
          clearTimeout(timer.timer);
          return timer.timer = setTimeout(timerCallbackFx, delay);
        });
      }
    };
    if (typeof element === 'string') {
      element = $(element);
    }
    return watchElement(element);
  };

}).call(this);
