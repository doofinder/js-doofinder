import { isPlainObject } from './is';

/**
 * Merge multiple objects into one.
 *
 * @remarks
 *
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
 * __WARNING:__ Be careful with arrays of objects, you can end having duplicates.
 *
 * @param objects - An undetermined number of objects to merge.
 * @returns An object resulting of merging the provided objects.
 * @public
 */
export function merge(...objects: Record<string, any>[]): Record<string, any> {
  let target: Record<string, any> = objects.shift();

  if (target == null || (!isPlainObject(target) && !Array.isArray(target))) {
    target = {};
  }

  objects
    .filter(x => isPlainObject(x) || Array.isArray(x))
    .forEach(function(obj: Record<string, any>) {
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
