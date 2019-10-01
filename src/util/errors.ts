/*
 * Helper to compose final error messages
 * @param  {String} text     Description of the error.
 * @param  {Object} instance Optional object instance.
 * @return {String}          Final error message.
 */

function _msg(text: string, instance: object) {
  if (instance) 
    //@ts-ignore
    return `[doofinder][${instance.constructor.name}]: ${text}`
  else
    return `[doofinder]: ${text}`
}

export function error(text: string, instance: object) {
  return new Error(_msg(text, instance));
}

export function warning(text: string, instance: object) {
  if (console)
    console.warn(_msg(text, instance));
}
