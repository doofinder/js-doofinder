import { QueryValueError } from './error';
import { isPlainObject, isShallowEqual, isString, isNumber } from '../util/is';
import { clone } from '../util/clone';

/**
 * Manage filters applied to a query.
 * @public
 */
export class QueryFilter {
  private _filters: Map<string, unknown> = new Map();

  /**
   * Retrieve the value of a filter.
   *
   * @param name - Name of the filter.
   * @returns The value of the filter.
   * @public
   */
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
   * @param name - Name of the field.
   * @param value - Value of the filter.
   * @public
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

  /**
   * Check whether there's a filter for the provided name or not.
   *
   * @param name - Name of the field.
   * @returns A boolean value.
   */
  public has(name: string): boolean {
    return this._filters.has(name);
  }

  /**
   * Check whether there's a filter for the provided name and it contains
   * the provided value or not.
   *
   * @param name - Name of the field.
   * @param value - The value for the filter.
   * @returns A boolean value.
   */
  public contains(name: string, value: unknown): boolean {
    return this.has(name) && this._filterContainsOrEqualsValue(name, value, false);
  }

  /**
   * Check whether there's a filter for the provided name and it's
   * equal to the provided value or not.
   *
   * @param name - Name of the field.
   * @param value - The value for the filter.
   * @returns A boolean value.
   */
  public equals(name: string, value: unknown): boolean {
    return this.has(name) && this._filterContainsOrEqualsValue(name, value, true);
  }

  /**
   * Add a value to filter by a field.
   *
   * @remarks
   *
   * - If the filter does not exist, it is created.
   * - If the value is an object, the value for the filter is replaced.
   * - Otherwise is supposed to be a Set of terms / numbers.
   *
   * @param name - Name of the filter.
   * @param value - Value to add to the filter.
   * @public
   */
  public add(name: string, value: unknown): void {
    const added: Set<unknown> | unknown = this._normalize(value);
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

  /**
   * Remove a filter by a field.
   *
   * @remarks
   *
   * - If the value is not provided, the filter is removed.
   * - If the value is an object, the filter is removed.
   * - Otherwise the value is removed from the list of terms.
   *
   * @param name - Name of the filter.
   * @param value - Optional. Value to remove from the filter.
   * @public
   */
  public remove(name: string, value?: unknown): void {
    const existing: Set<unknown> | unknown = this._filters.get(name);
    if (existing instanceof Set && value != null) {
      const deleted: Set<unknown> | unknown = this._normalize(value);
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

  /**
   * Clear all filters.
   * @public
   */
  public clear(): void {
    this._filters.clear();
  }

  /**
   * Set multiple filters at once.
   *
   * @param data - An object with all the filters to be set.
   * @param replace - Boolean value telling whether to replace any
   * existing filter or not.
   *
   * @public
   */
  public setMany(data: Record<string, any>, replace = false): void {
    if (replace) {
      this.clear();
    }
    for (const key in data) {
      this.set(key, data[key]);
    }
  }

  /**
   * Dump all filters as an object.
   * @returns An object with fields as keys and filter values as values.
   * @public
   */
  public dump(): Record<string, any> {
    const data: Record<string, any> = {};
    this._filters.forEach((value, key) => {
      data[key] = this._denormalize(value);
    });
    if (Object.keys(data).length > 0) {
      return data;
    }
  }

  private _normalize(value: unknown): Set<unknown> | unknown {
    if (isString(value) || isNumber(value)) {
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

  private _filterContainsOrEqualsValue(name: string, value: unknown, checkEquality: boolean): boolean {
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
      return isShallowEqual(filterValue, normalized);
    }
  }
}
