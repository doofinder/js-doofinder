export const isString = (value) => Object.prototype.toString.call(value) === '[object String]';
export const isNumber = (value) => Object.prototype.toString.call(value) === '[object Number]';
export const isFunction = (value) => Object.prototype.toString.call(value) === '[object Function]';
export const isArray = (value) => Array.isArray(value);
export const isObject = (value) => Object.prototype.toString.call(value) === '[object Object]';
export const isPlainObject = (value) => isObject(value) &&
    value.constructor === Object &&
    !value.nodeType &&
    !value.setInterval;
export const isWindow = (element) => element && typeof element === 'object' && 'setInterval' in element;
export const isDocument = (element) => element && typeof element.documentElement === 'object';
export const isElement = (element) => element !== undefined &&
    typeof HTMLElement !== 'undefined' &&
    element instanceof HTMLElement &&
    element.nodeType === 1;
export const isSvgElement = (element) => element !== undefined && typeof SVGElement !== 'undefined' && element instanceof SVGElement && element.nodeType === 1;
export const isNotNull = (element) => typeof element !== "undefined" && element !== null;
//# sourceMappingURL=is.js.map