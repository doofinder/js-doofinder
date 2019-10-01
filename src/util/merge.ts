import { isPlainObject, isArray } from './is';

/**
 * Heavily based on https://www.npmjs.com/package/extend.
 *
 * While extend() fully extends objects, this version only touches own
 * properties and not inherited ones. This is intended to extend only option
 * objects, not functions used as constructors or anything like that.
 *
 * Why? Try to use PrototypeJS in the same page as Doofinder and use extend
 * instead to have some fun debugging.
 *
 * Works the same as extend, but merge is always "deep"
 *
 * WARNING: Be careful with arrays of objects, you can end having duplicates.
 */

export function merge(target?: any, ...propValues: any[]) {
  if (target == null || (typeof target !== 'object' && typeof target !== 'function')) target = {};

  if (propValues.length > 0) {
    for (const obj in propValues) {
      if (obj) {
        for (let propName, propValue of obj) {
          if (obj.hasOwnProperty(propName)) {
            let src = target[propName];
            if (target !== propValue) {
              if (propValue && ((isPlainObject(propValue)) || isArray(propValue)))
                let clone: any;
                if (isArray(propValue)) {
                  let propValueIsArray = false;
                  clone = (src && isArray(src)) ? src : [];
                } else {
                  clone = (src && isPlainObject(src)) ? src : {};
                }
                target[propName] = merge(clone, propValue);
            } else if (typeof propValue !== "undefined") {
                target[propName] = propValue
            }
          }
        }
      }
    }
  }

  return target;
