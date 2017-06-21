extend = require 'extend'
$ = require './dfdom'

module.exports = (element, options) ->
  _supportedInputTypes = ['TEXT', 'TEXTAREA', 'PASSWORD', 'TEL', 'SEARCH', 'URL',
                          'EMAIL', 'DATETIME', 'DATE', 'MONTH', 'WEEK', 'TIME', 'DATETIME-LOCAL',
                          'NUMBER', 'RANGE']
  defaults =
    wait: 750,
    callback: ->,
    highlight: true,
    captureLength: 2,
    inputTypes: _supportedInputTypes

  options = extend true, {}, defaults, options

  checkElement = (timer, override) ->
    value = timer.el.val() or ''

    if value.length >= options.captureLength and value.toUpperCase() != timer.text or
        override and value.length >= options.captureLength or
        value.length == 0 and timer.text
      timer.text = value.toUpperCase()
      timer.cb.call timer.el, value

  watchElement = (elem) ->
    inputType = elem.attr('type')
    if not inputType
      inputType = 'text'

    if inputType.toUpperCase() in options.inputTypes
      # Allocate timer element
      timer =
        timer: null
        text: elem.value or ''
        cb: options.callback
        wait: options.wait
        el: elem

      elem.on 'keydown paste cut input change', (e) ->
        delay = timer.wait
        override = false
        inputType = this.type.toUpperCase()

        if e.keyCode? and e.keyCode is 13 and inputType != 'TEXTAREA' and
            inputType in options.inputTypes
          delay = 1
          override = true

        timerCallbackFx = () ->
          checkElement(timer, override)

        # Clear timer
        clearTimeout(timer.timer)
        timer.timer = setTimeout timerCallbackFx, delay

  return watchElement $ element
