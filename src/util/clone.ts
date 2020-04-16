import { isPlainObject } from './is';

/**
 * Merge the contents of two or more objects together into the first object.
 *
 * @remarks
 *
 * Ported from {@link https://github.com/jquery/jquery/blob/7fb90a6beaeffe16699800f73746748f6a5cc2de/src/core.js#L118-L188 | jQuery}.
 *
 * @example
 *
 * ```
 * extend( [deep ], target, object1 [, objectN ] )
 * ```
 *
 * @param deep - Boolean. If true, the merge becomes recursive
 * (aka. deep copy). Passing false for this argument is not supported.
 * Optional.
 * @param target - Object. The object to extend. It will receive the
 * new properties.
 * @param object1 - Object. An object containing additional properties
 * to merge in.
 * @param objectN - Object. Additional objects containing properties
 * to merge in.
 * @returns A copy of the provided object.
 *
 * @public
 */
export const extend = function(...args: unknown[]): Record<string, any> | Array<any> {
  const length: number = args.length;
  let target: Record<string, any> = args[0] || {},
    i = 1,
    deep = false;

  let options: Record<string, any>, name: string, src: unknown, copy: unknown, copyIsArray: boolean, clone: unknown;

  // Handle a deep copy situation
  if (typeof target === 'boolean') {
    deep = target;

    // Skip the boolean and the target
    target = args[i] || {};
    i++;
  }

  // Handle case when target is a string or something (possible in deep copy)
  if (typeof target !== 'object' && typeof target !== 'function') {
    target = {};
  }

  // return if only one argument is passed
  if (i === length) {
    return target;
  }

  for (; i < length; i++) {
    // Only deal with non-null/undefined values
    if ((options = args[i]) != null) {
      // Extend the base object
      for (name in options) {
        copy = options[name];

        // Prevent Object.prototype pollution
        // Prevent never-ending loop
        if (name === '__proto__' || target === copy) {
          continue;
        }

        // Recurse if we're merging plain objects or arrays
        if (deep && copy && (isPlainObject(copy) || (copyIsArray = Array.isArray(copy)))) {
          src = target[name];

          // Ensure proper type for the source value
          if (copyIsArray && !Array.isArray(src)) {
            clone = [];
          } else if (!copyIsArray && isPlainObject(src)) {
            clone = {};
          } else {
            clone = src;
          }
          copyIsArray = false;

          // Never move original objects, clone them
          target[name] = extend(deep, clone, copy);

          // Don't bring in undefined values
        } else if (copy !== undefined) {
          target[name] = copy;
        }
      }
    }
  }

  // Return the modified object
  return target;
};

/**
 * Create a copy of the provided data.
 *
 * @param src - The data to clone.
 * @returns A copy of the data.
 *
 * @public
 */
export function clone(src: any): any {
  if (Array.isArray(src)) {
    return extend(true, [], src);
  } else if (isPlainObject(src)) {
    return extend(true, {}, src);
  } else {
    return src;
  }
}
/* eslint-enable @typescript-eslint/no-use-before-define */
