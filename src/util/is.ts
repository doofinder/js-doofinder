import { GenericObject } from '../types';

export const isString = (value: unknown): boolean => Object.prototype.toString.call(value) === '[object String]';

export const isNumber = (value: unknown): boolean => Object.prototype.toString.call(value) === '[object Number]';

export const isArray = (value: unknown): boolean => Array.isArray(value);

export const isObject = (value: unknown): boolean => Object.prototype.toString.call(value) === '[object Object]';

export const isPlainObject = (value: unknown): boolean =>
  isObject(value) &&
  value.constructor === Object &&
  !(value as GenericObject).nodeType &&
  !(value as GenericObject).setInterval;

export const isWindow = (element: unknown): boolean =>
  element && typeof element === 'object' && 'setInterval' in element;

export const isDocument = (element: unknown): boolean =>
  element && typeof (element as Document).documentElement === 'object';

export const isElement = (element: unknown): boolean =>
  element !== undefined &&
  typeof HTMLElement !== 'undefined' &&
  element instanceof HTMLElement &&
  element.nodeType === 1;

export const isSvgElement = (element: unknown): boolean =>
  element !== undefined && typeof SVGElement !== 'undefined' && element instanceof SVGElement && element.nodeType === 1;
