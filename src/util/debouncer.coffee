requestAnimationFrame = window.requestAnimationFrame or window.webkitRequestAnimationFrame or window.mozRequestAnimationFrame

###*
 * Avoids handling an event every time it fires, asking the browser to do it.
 * Copied and modified from: github:WickyNilliams/headroom.js's Debouncer.js
###
class Debouncer
  ###*
   * Instantiates a new Debouncer.
   * @param  {Function} callback Event handler to be executed.
  ###
  constructor: (@callback) ->
    @ticking = false

  ###*
   * Event handler method, it's executed always instead of the original
   * callback.
  ###
  handleEvent: ->
    unless @ticking
      requestAnimationFrame @boundCallback or (@boundCallback = @update.bind @)
      @ticking = true

  ###*
   * Executes the configured callback and re-enables the callback to be queued.
  ###
  update: ->
    @callback()
    @ticking = false

module.exports = Debouncer
