(function() {
  var Debouncer, requestAnimationFrame;

  requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame;


  /**
   * Avoids handling an event every time it fires, asking the browser to do it.
   * Copied and modified from: github:WickyNilliams/headroom.js's Debouncer.js
   */

  Debouncer = (function() {

    /**
     * Instantiates a new Debouncer.
     * @param  {Function} callback Event handler to be executed.
     */
    function Debouncer(callback) {
      this.callback = callback;
      this.ticking = false;
    }


    /**
     * Event handler method, it's executed always instead of the original
     * callback.
     */

    Debouncer.prototype.handleEvent = function() {
      if (!this.ticking) {
        requestAnimationFrame(this.boundCallback || (this.boundCallback = this.update.bind(this)));
        return this.ticking = true;
      }
    };


    /**
     * Executes the configured callback and re-enables the callback to be queued.
     */

    Debouncer.prototype.update = function() {
      this.callback();
      return this.ticking = false;
    };

    return Debouncer;

  })();

  module.exports = Debouncer;

}).call(this);
