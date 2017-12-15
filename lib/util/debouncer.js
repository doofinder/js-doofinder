(function() {
  var Debouncer, requestAnimationFrame;

  requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame;

  Debouncer = (function() {
    function Debouncer(callback) {
      this.callback = callback;
      this.ticking = false;
    }

    Debouncer.prototype.update = function() {
      if (typeof this.callback === "function") {
        this.callback();
      }
      return this.ticking = false;
    };

    Debouncer.prototype.tick = function() {
      if (!this.ticking) {
        requestAnimationFrame(this.boundCallback || (this.boundCallback = this.update.bind(this)));
        return this.ticking = true;
      }
    };

    Debouncer.prototype.handleEvent = function() {
      return this.tick();
    };

    return Debouncer;

  })();

  module.exports = Debouncer;

}).call(this);
