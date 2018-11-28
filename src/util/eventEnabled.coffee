bean = require "bean"


class EventEnabled
  ###*
   * Registers a function that is executed when certain event is triggered on
   * the instance.
   *
   * @param  {String}   eventName Event name (or multiple events, space
   *                              separated).
   * @param  {Function} handler   The callback function.
   * @public
  ###
  on: (eventName, handler) ->
    bean.on @, eventName, handler

  ###*
   * Registers a function that is executed when certain event is triggered on
   * the instance the first time after this function is executed.
   *
   * @param  {String}   eventName Event name (or multiple events, space
   *                              separated).
   * @param  {Function} handler   The callback function.
   * @public
  ###
  one: (eventName, handler) ->
    bean.one @, eventName, handler

  ###*
   * Unregisters an event handler of this instance.
   *
   * - If no handler is provided, all event handlers for the event name provided
   *   are unregistered for the current instance.
   * - If no handler and no event name are provided, all event handlers are
   *   unregistered for the current instance.
   *
   * @param  {String}   eventName Event name (or multiple events, space
   *                              separated). Optional.
   * @param  {Function} handler   The callback function. Optional.
   * @public
  ###
  off: (eventName, handler) ->
    bean.off @, eventName, handler

  ###*
   * Triggers an event in the current instance.
   *
   * @param  {String} eventName Event name (or multiple events, space
   *                            separated).
   * @param  {Array}  args      Array of arguments to pass to the event handler.
   * @public
  ###
  trigger: (eventName, args) ->
    bean.fire @, eventName, args


module.exports = EventEnabled
