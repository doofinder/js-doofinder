throttle = require "lodash.throttle"

$ = require "../util/dfdom"
EventEnabled = require "../util/eventEnabled"
merge = require "../util/merge"


class ScrollManager extends EventEnabled
  constructor: (container, options = {}) ->
    defaults =
      horizontal: false
      offset: 300
      throttle: 16

    @container = $ container
    @options = merge defaults, options
    @previousDelta = 0

    fn = if @options.horizontal then @__scrollX else @__scrollY
    @container.on "scroll", (throttle (fn.bind @), @options.throttle)

  __scrollX: ->
    rect = @container.box()
    width = rect.scrollWidth
    scrolled = rect.scrollLeft + rect.clientWidth
    direction = if rect.scrollLeft >= @previousDelta then "right" else "left"
    offsetReached = width - scrolled <= @options.offset

    @previousDelta = rect.scrollLeft

    @trigger "scroll", [rect.scrollLeft, direction, offsetReached]

  __scrollY: ->
    rect = @container.box()
    height = rect.scrollHeight
    scrolled = rect.scrollTop + rect.clientHeight
    direction = if rect.scrollTop >= @previousDelta then "down" else "up"
    offsetReached = height - scrolled <= @options.offset

    @previousDelta = rect.scrollTop

    @trigger "scroll", [rect.scrollTop, direction, offsetReached]


module.exports = ScrollManager
