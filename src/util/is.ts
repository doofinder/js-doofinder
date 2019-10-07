import { GenericObject } from '../types';

export const isArray = (value: unknown): boolean => Array.isArray(value);

export const isObject = (value: unknown): boolean => Object.prototype.toString.call(value) === '[object Object]';

export const isPlainObject = (value: unknown): boolean =>
  isObject(value) &&
  value.constructor === Object &&
  !(value as GenericObject).nodeType &&
  !(value as GenericObject).setInterval;

export const isNotNull = (element: unknown): boolean =>
  typeof element !== "undefined" && element !== null
