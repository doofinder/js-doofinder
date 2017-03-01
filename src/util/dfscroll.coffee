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
    content: container.children().first()
    throttle: 250
  options = extend(true, defaults, options || {})

  content = $ options.content
  contentElement = content.element[0]

  container.on 'df:scroll', ->
    contentHeight = contentElement.clientHeight
    containerHeight = containerElement.offsetHeight
    containerScroll = container.scrollTop()
    delta = contentHeight - containerHeight - containerScroll
    # delta = Math.abs(contentHeight - containerHeight - containerScroll)

    console.log "contentHeight: #{contentHeight} / containerHeight: #{containerHeight} / containerScroll: #{containerScroll} / delta: #{delta}"

    # if containerScroll > 0 and delta >= 0 and
    # Trigger only on scroll down
    if delta > 0 and delta <= options.scrollOffset
      options.callback()

  # Avoid too much event triggering
  fn = (e) -> bean.fire container.element[0], 'df:scroll'
  bean.on containerElement, 'scroll', throttle(fn, options.throttle, leading: true)
