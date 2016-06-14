extend = require('./extend')

dfTypeWatch = (element, options) ->
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
    value = timer.el.value or ''

    if value.length >= options.captureLength and value.toUpperCase() != timer.text or
        override and value.length >= options.captureLength or
        value.length == 0 and timer.text
      timer.text = value.toUpperCase()
      timer.cb.call timer.el, value

  watchElement = (elem) ->
    elementType = elem.getAttribute('type').toUpperCase()
    value = elem.value or ''

    if options.inputTypes.indexOf(elementType) >= 0
      # Allocate timer element
      timer =
        timer: null
        text: value
        cb: options.callback
        wait: options.wait
        el: elem

      startWatch = (evt) ->
        timerWait = timer.wait
        overrideBool = false
        evtElementType = this.type.toUpperCase()

        if typeof evt.keyCode isnt 'undefined' and
            evt.keyCode is 13 and
            evtElementType != 'TEXTAREA' and
            options.inputTypes.indexOf(evtElementType) >= 0
          timerWait = 1
          overrideBool = true

        timerCallbackFx = () ->
          checkElement(timer, overrideBool)

        # Clear timer
        clearTimeout(timer.timer)
        timer.timer = setTimeout timerCallbackFx, timerWait

      elem.addEventListener 'keydown', startWatch
      elem.addEventListener 'paste', startWatch
      elem.addEventListener 'cut', startWatch
      elem.addEventListener 'input', startWatch
      elem.addEventListener 'change', startWatch

  if typeof element is 'string'
    element = document.querySelector element

  return watchElement element

module.exports = dfTypeWatch
