import { encode } from 'qss';

import { DoofinderParameters, GenericObject } from '../types';
import { isArray, isPlainObject } from './is';

/**
 * As qss is incapable of processing objects for query params, we preprocess
 * the params to create string keys where needed so it will work as expected
 *
 */

// Somehow, using this function and define it later is not allowed for some reason
// so we go again on having headers defined somewhere
let _processArray = (elems: Array<unknown>, key: string | number): GenericObject => {
  return {};
};

function _processObjects(
  queryParams: DoofinderParameters | GenericObject,
  currentKey?: string | number
): GenericObject {
  const result: GenericObject = {};
  let supraKey = '';
  if (currentKey) {
    supraKey = '' + currentKey;
  }
  Object.keys(queryParams).forEach((key: string) => {
    const subkey = supraKey.length > 0 ? `${supraKey}[${key}]` : key;

    if (isArray(queryParams[key])) {
      const elements = _processArray(queryParams[key], subkey);
      Object.assign(result, elements);
    } else if (isPlainObject(queryParams[key])) {
      const elements = _processObjects(queryParams[key], subkey);
      Object.assign(result, elements);
    } else {
      result[subkey] = queryParams[key];
    }
  });

  return result;
}

_processArray = (elems: Array<unknown>, key: string | number): GenericObject => {
  const result: GenericObject = {};
  elems.forEach((elem: unknown, index: number) => {
    if (isArray(elem)) {
      const elements = _processArray(elem as Array<unknown>, `${key}[${index}]`);
      Object.assign(result, elements);
    } else if (isPlainObject(elem)) {
      const elements = _processObjects(elem, `${key}[${index}]`);
      Object.assign(result, elements);
    } else {
      result[`${key}[${index}]`] = elem;
    }
  });

  return result;
};

/**
 * Wrapper function to parse objects in a way qss will encode nested structures
 * correctly in the query params string resulting
 *
 */
export function buildQueryParamsString(obj: DoofinderParameters | GenericObject): string {
  const processedObject = _processObjects(obj);

  return encode(processedObject);
}
