import { encode } from 'qss';

import { isPlainObject } from './is';
import { GenericObject } from '../types';
import { clone } from './clone';

/**
 * As qss is incapable of processing objects for query params, we preprocess
 * the params to create string keys where needed so it will work as expected
 *
 */

function _updateResult(result: GenericObject<string>, value: unknown, param: string): GenericObject {
  if (Array.isArray(value)) {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    return Object.assign(result, _processArray(value as Array<unknown>, param));
  } else if (isPlainObject(value)) {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    return Object.assign(result, _processObject(value as GenericObject, param));
  } else {
    return Object.assign(result, { [param]: value });
  }
}

function _processObject(keyValueObj: GenericObject, targetKey = ''): GenericObject {
  return Object.keys(keyValueObj).reduce((result: GenericObject, key: string): GenericObject => {
    const value = keyValueObj[key];
    const param = targetKey.length > 0 ? `${targetKey}[${key}]` : key;
    return _updateResult(result, value, param);
  }, {});
}

function _processArray(valueList: Array<unknown>, key: string | number): GenericObject {
  return valueList.reduce((result: GenericObject, value: unknown, index: number) => {
    const param = `${key}[${index}]`;
    return _updateResult(result, value, param);
  }, {});
}

/**
 * Wrapper function to parse objects in a way qss will encode nested structures
 * correctly in the query params string resulting
 *
 */
export function buildQueryString(paramsObj: GenericObject): string {
  if (!isPlainObject(paramsObj)) {
    throw new Error('Not an object');
  }

  const params: GenericObject = clone(paramsObj);

  for (const key in params) {
    if (typeof params[key] === 'undefined') {
      delete params[key];
    } else if (params[key] === null) {
      params[key] = '';
    }
  }

  return encode(_processObject(params));
}
