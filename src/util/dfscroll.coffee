$ = require './dfdom'
bean = require 'bean'
extend = require 'extend'
throttle = require 'lodash.throttle'

module.exports = (container, options = null) ->
  container = $ container

  defaults =
    callback: ->
    scrollOffset: 200
    content: container.children().first()
    throttle: 100
  options = extend(true, defaults, options || {})

  content = $ options.content

  container.on 'df:scroll', ->
    contentHeight = content.height()
    containerHeight = container.height()
    containerScroll = container.scrollTop()
    delta = contentHeight - containerHeight - containerScroll

    if delta <= options.scrollOffset
      options.callback()

  # Avoid too much event triggering
  fn = (e) ->
    e.stopPropagation()
    bean.fire container.element[0], 'df:scroll'
  bean.on container.element[0], 'scroll', throttle(fn, options.throttle, leading: true)
