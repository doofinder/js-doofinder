import { Zone } from '../types';

export const isString = (value: unknown): boolean => Object.prototype.toString.call(value) === '[object String]';

export const isNumber = (value: unknown): boolean => Object.prototype.toString.call(value) === '[object Number]';

export const isArray = (value: unknown): boolean => Array.isArray(value);

export const isObject = (value: unknown): boolean => Object.prototype.toString.call(value) === '[object Object]';

export const isPlainObject = (value: unknown): boolean =>
  isObject(value) && value.constructor === Object && !(value as Node).nodeType && !(value as Window).setInterval;

export const isValidZone = (zone: string): boolean => Object.values(Zone).includes(zone as Zone);

const dfidRegex = /^([0-9a-f]{32})@([\w-]+)@([0-9a-f]{32})$/i;

/**
 * Returns True if the string conforms to a
 * doofinder ID
 *
 */
export function isDfid(str: string): boolean {
  return dfidRegex.test(str);
}
