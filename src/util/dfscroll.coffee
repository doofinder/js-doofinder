$ = require './dfdom'
bean = require 'bean'
extend = require 'extend'
throttle = require 'lodash.throttle'

module.exports = (container, options = null) ->
  container = $ container
  containerElement = container.element[0]

  defaults =
    callback: ->
    scrollOffset: 200
    content: if containerElement is window then $ "body" else container.children().first()
    throttle: 250
  options = extend(true, defaults, options || {})

  content = $ options.content

  container.on 'df:scroll', ->
    contentHeight = content.height()
    containerHeight = container.height()
    containerScroll = container.scrollTop()
    delta = Math.max(0, contentHeight - containerHeight - containerScroll)

    # Trigger only on scroll down
    if containerScroll > 0 and delta >= 0 and delta <= options.scrollOffset
      options.callback()

  # Avoid too much event triggering
  fn = (e) -> bean.fire container.element[0], 'df:scroll'
  bean.on containerElement, 'scroll', throttle(fn, options.throttle, leading: true)
