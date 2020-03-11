/* eslint-disable prettier/prettier */
import type { GenericObject } from '../types';
/* eslint-enable prettier/prettier */

import { QueryValueError } from './error';
import { isPlainObject, shallowEqual, isString, isNumber } from '../util/is';
import { clone } from '../util/clone';

/**
 * Manage filters applied to a query.
 * @beta
 */
export class QueryFilter {
  private _filters: Map<string, unknown> = new Map();

  public get(name: string): unknown {
    return this._denormalize(this._filters.get(name));
  }

  /**
   * Set the value of a filter.
   *
   * @remarks
   *
   * Setting the value of a filter will replace any existing value.
   *
   * @param name - Name of the filter.
   * @param value - Value of the filter.
   * @beta
   */
  public set(name: string, value: unknown): void {
    const normalized = this._normalize(value);
    if (normalized instanceof Set) {
      this._filters.set(name, normalized);
    } else if (isPlainObject(normalized) && Object.entries(normalized).length === 0) {
      throw new QueryValueError(`plain object filters can't be empty`);
    } else {
      this._filters.set(name, clone(normalized));
    }
  }

  public has(name: string): boolean {
    return this._filters.has(name);
  }

  public contains(name: string, value: unknown): boolean {
    return this.has(name) && this._filterContainsOrEqualsValue(name, value, false);
  }

  public equals(name: string, value: unknown): boolean {
    return this.has(name) && this._filterContainsOrEqualsValue(name, value, true);
  }

  /**
   * Add a value to filter.
   *
   * @remarks
   *
   * - If the filter does not exist, it is created.
   * - If the value is an object, the value for the filter is replaced.
   * - Otherwise is supposed to be a Set of terms / numbers.
   *
   * @param name - Name of the filter.
   * @param value - Value to add to the filter.
   * @beta
   */
  public add(name: string, value: unknown): void {
    const added: Set<unknown> | unknown = this._normalize(value);
    const existing: Set<unknown> | unknown = this._filters.get(name);

    if (existing instanceof Set) {
      if (added instanceof Set) {
        this._filters.set(name, new Set([...existing, ...added]));
      } else {
        existing.add(added);
      }
    } else {
      this._filters.set(name, added);
    }
  }

  public remove(name: string, value?: unknown): void {
    const existing: Set<unknown> | unknown = this._filters.get(name);
    if (existing instanceof Set && value != null) {
      const deleted: Set<unknown> | unknown = this._normalize(value);
      if (deleted instanceof Set) {
        for (const item of deleted) {
          existing.delete(item);
        }
      } else {
        existing.delete(deleted);
      }
      if (existing.size === 0) {
        this._filters.delete(name);
      }
    } else {
      this._filters.delete(name);
    }
  }

  public toggle(name: string, value: unknown): void {
    if (this.has(name)) {
      if (this.equals(name, value)) {
        this.remove(name);
      } else {
        throw new QueryValueError(`can't toggle value: values don't match`);
      }
    } else {
      this.set(name, value);
    }
  }

  public clear(): void {
    this._filters.clear();
  }

  public setMany(data: GenericObject<unknown>, replace = false): void {
    if (replace) {
      this.clear();
    }
    for (const key in data) {
      this.set(key, data[key]);
    }
  }

  public dump(): GenericObject<unknown> {
    const data: GenericObject<unknown> = {};
    this._filters.forEach((value, key) => {
      data[key] = this._denormalize(value);
    });
    if (Object.keys(data).length > 0) {
      return data;
    }
  }

  private _normalize(value: unknown): Set<unknown> | unknown {
    if (isString(value) || isNumber(value)) {
      return new Set([value]);
    } else if (Array.isArray(value)) {
      return new Set(value);
    } else {
      return value;
    }
  }

  private _denormalize(value: unknown): unknown {
    return value instanceof Set ? [...value] : value;
  }

  private _filterContainsOrEqualsValue(
    name: string,
    value: unknown,
    checkEquality: boolean
  ): boolean {
    const normalized = this._normalize(value);
    const filterValue = this._filters.get(name);

    if (filterValue instanceof Set && normalized instanceof Set) {
      if (checkEquality && filterValue.size !== normalized.size) {
        return false;
      }

      for (const term of normalized) {
        if (!filterValue.has(term)) {
          return false;
        }
      }

      return true;
    } else {
      return shallowEqual(filterValue, normalized);
    }
  }
}
