extend = require('./extend').extend

dfTypeWatch = (input, o) ->
  _supportedInputTypes = ['TEXT', 'TEXTAREA', 'PASSWORD', 'TEL', 'SEARCH', 'URL', 'EMAIL', 'DATETIME', 'DATE', 'MONTH', 'WEEK', 'TIME', 'DATETIME-LOCAL', 'NUMBER', 'RANGE']
  
  # Options
  defaultOptions =
    wait: 750,
    callback: ->,
    highlight: true,
    captureLength: 2,
    inputTypes: _supportedInputTypes

  options = extend(defaultOptions, o)
 
  checkElement = (timer, override) -> 
    value = timer.el.value || ''
    
    if value.length >= options.captureLength and value.toUpperCase() != timer.text or override and value.length >= options.captureLength or value.length == 0 and timer.text
      timer.text = value.toUpperCase()
      timer.cb.call timer.el, value

  watchElement = (elem) ->
    elementType = elem.getAttribute('type').toUpperCase()
    value = elem.value || ''

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

        if typeof evt.keyCode != 'undefined' and evt.keyCode == 13 and evtElementType != 'TEXTAREA' and options.inputTypes.indexOf(evtElementType) >= 0
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

  return watchElement(document.querySelector(input))   

module.exports = dfTypeWatch  
                

