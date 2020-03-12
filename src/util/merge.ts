import { isPlainObject } from './is';
import { GenericObject } from '../types';

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
export function merge(...objects: GenericObject[]): GenericObject {
  let target: GenericObject = objects.shift();

  if (target == null || (!isPlainObject(target) && !Array.isArray(target))) {
    target = {};
  }

  objects
    .filter(x => isPlainObject(x) || Array.isArray(x))
    .forEach(function(obj: GenericObject) {
      if (obj == null) return;

      for (const propName in obj) {
        if (!obj.hasOwnProperty(propName)) continue;

        const propValue: unknown = obj[propName];
        const src: unknown = target[propName];

        if (target !== propValue) {
          if (isPlainObject(propValue)) {
            target[propName] = merge(isPlainObject(src) ? src : {}, propValue);
          } else if (Array.isArray(propValue)) {
            target[propName] = merge(Array.isArray(src) ? src : [], propValue);
          } else if (typeof propValue !== 'undefined') {
            target[propName] = propValue;
          }
        }
      }
    });

  return target;
}
