# https://github.com/WickyNilliams/headroom.js/blob/3282c23/src/Debouncer.js
requestAnimationFrame = window.requestAnimationFrame or window.webkitRequestAnimationFrame or window.mozRequestAnimationFrame

class Debouncer
  constructor: (@callback) ->
    @ticking = false

  update: ->
    @callback?()
    @ticking = false

  tick: ->
    unless @ticking
      requestAnimationFrame @boundCallback or (@boundCallback = @update.bind @)
      @ticking = true

  handleEvent: ->
    @tick()

module.exports = Debouncer
