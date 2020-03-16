// added nanoclone this way due to a lack of types and small size
/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable @typescript-eslint/no-explicit-any */
/*! MIT - https://github.com/Kelin2025/nanoclone */
function baseClone(src: any, circulars: any[], clones: any[]): any {
  // Null/undefined/functions/etc
  if (!src || typeof src !== 'object' || typeof src === 'function') {
    return src;
  }

  // DOM Node
  if (src.nodeType && 'cloneNode' in src) {
    return src.cloneNode(true);
  }

  // Date
  if (src instanceof Date) {
    return new Date(src.getTime());
  }

  // RegExp
  if (src instanceof RegExp) {
    return new RegExp(src);
  }

  // Arrays
  if (Array.isArray(src)) {
    return src.map(clone);
  }

  // ES6 Maps
  if (src instanceof Map) {
    return new Map(Array.from(src.entries()));
  }

  // ES6 Sets
  if (src instanceof Set) {
    return new Set(Array.from(src.values()));
  }

  // Object
  if (src instanceof Object) {
    circulars.push(src);
    const obj = Object.create(src);
    clones.push(obj);
    for (const key in src) {
      const idx = circulars.findIndex(function(i) {
        return i === src[key];
      });
      obj[key] = idx > -1 ? clones[idx] : baseClone(src[key], circulars, clones);
    }
    return obj;
  }

  return src;
}

/**
 * Create a copy of the provided data.
 *
 * @param src - The data to clone.
 * @returns A copy of the data.
 * @public
 */
export function clone(src: any): any {
  return baseClone(src, [], []);
}
/* eslint-enable @typescript-eslint/no-explicit-any */
/* eslint-enable @typescript-eslint/no-use-before-define */
