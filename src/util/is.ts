/**
 * Check if the provided value is a string.
 * @param value - The value to check.
 * @returns `true` if the value is a string, `false` otherwise.
 * @public
 */
export const isString = (value: unknown): boolean => Object.prototype.toString.call(value) === '[object String]';

/**
 * Check if the provided value is a number.
 * @param value - The value to check.
 * @returns `true` if the value is a number, `false` otherwise.
 * @public
 */
export const isNumber = (value: unknown): boolean => Object.prototype.toString.call(value) === '[object Number]';

/**
 * Check if the provided value is an object.
 * @param value - The value to check.
 * @returns `true` if the value is an object, `false` otherwise.
 * @public
 */
export const isObject = (value: unknown): boolean => Object.prototype.toString.call(value) === '[object Object]';

/**
 * Check if the provided value is an empty object.
 * @param value - The value to check.
 * @returns `true` if the value is an empty object, `false` otherwise.
 * @public
 */
export function isEmptyObject(obj: unknown): boolean {
  return Object.keys(obj).length === 0 && obj.constructor === Object;
}

/**
 * Check if the provided value is a plain object.
 * @param value - The value to check.
 * @returns `true` if the value is a plain object, `false` otherwise.
 * @public
 */
export const isPlainObject = (value: unknown): boolean =>
  isObject(value) && value.constructor === Object && !(value as Node).nodeType && !(value as Window).setInterval;

const DFID_REGEX = /^([0-9a-f]{32})@([\w-]+)@([0-9a-f]{32})$/i;
const HASHID_REGEX = /^([0-9a-f]{32})(-.*)?/i;

/**
 * Check if the provided value is a valid Doofinder Id.
 * @param value - The value to check.
 * @returns `true` if the value is a valid Doofinder Id, `false` otherwise.
 * @public
 */
export function isValidDoofinderId(value: unknown): boolean {
  return isString(value) && DFID_REGEX.test(value as string);
}

/**
 * Check if the provided value is a valid Hash Id.
 * @param value - The value to check.
 * @returns `true` if the value is a valid Hash Id, `false` otherwise.
 * @public
 */
export function isValidHashId(value: unknown): boolean {
  return isString(value) && HASHID_REGEX.test(value as string);
}
/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule shallowEqual
 * @typechecks
 * @flow
 */

/* eslint-disable no-self-compare */
/**
 * Check whether two values are identical or not.
 *
 * @privateRemarks
 *
 * inlined Object.is polyfill to avoid requiring consumers ship their own
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is
 *
 * @param x - First value to check.
 * @param y - Second value to check.
 * @returns A boolean value indicating if both values are identical.
 * @public
 */
export const isIdentical = function(x: any, y: any): boolean {
  // SameValue algorithm
  if (x === y) {
    // Steps 1-5, 7-10
    // Steps 6.b-6.e: +0 != -0
    // Added the nonzero y check to make Flow happy, but it is redundant
    return x !== 0 || y !== 0 || 1 / x === 1 / y;
  } else {
    // Step 6.a: NaN == NaN
    return x !== x && y !== y;
  }
};

/**
 * Check whether two values are equivalent or not.
 *
 * @remarks
 *
 * Performs equality by iterating through keys on an object and returning false
 * when any key has values which are not strictly equal between the arguments.
 * Returns true when the values of all keys are strictly equal.
 *
 * @param objA - First value to check.
 * @param objB - Second value to check.
 * @returns A boolean value.
 * @public
 */
export const isShallowEqual = function(objA: any, objB: any): boolean {
  if (isIdentical(objA, objB)) {
    return true;
  }

  if (typeof objA !== 'object' || objA === null || typeof objB !== 'object' || objB === null) {
    return false;
  }

  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);

  if (keysA.length !== keysB.length) {
    return false;
  }

  // Test for A's keys different from B.
  for (let i = 0; i < keysA.length; i++) {
    if (!Object.prototype.hasOwnProperty.call(objB, keysA[i]) || !isIdentical(objA[keysA[i]], objB[keysA[i]])) {
      return false;
    }
  }

  return true;
};
/* eslint-enable no-self-compare */
