import { QueryValueError } from './error';
import { isPlainObject, shallowEqual } from '../util/is';
import { clone } from '../util/clone';
import { GenericObject } from '../types';

export interface RangeFilterInputValue {
  lte?: number;
  gte?: number;
  lt?: number;
  gt?: number;
}

export interface GeoDistanceFilterInputValue {
  [field: string]: string;
  distance: string;
}

export type TermsFilterInputValue = string | number | string[] | number[];
export type FilterInputValue = TermsFilterInputValue | RangeFilterInputValue | GeoDistanceFilterInputValue;

type TermsQueryFilter = Set<string | number>;
type QueryFilterValue = TermsQueryFilter | RangeFilterInputValue | GeoDistanceFilterInputValue;

/**
 * Manage filters applied to a query.
 * @beta
 */
export class QueryFilter {
  private _filters: Map<string, QueryFilterValue> = new Map();

  public get(name: string): FilterInputValue | unknown {
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
  public set(name: string, value: FilterInputValue | unknown): void {
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

  public contains(name: string, value: FilterInputValue | unknown): boolean {
    return this.has(name) && this._filterContainsOrEqualsValue(name, value, false);
  }

  public equals(name: string, value: FilterInputValue | unknown): boolean {
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
  public add(name: string, value: FilterInputValue | unknown): void {
    if (!(this._filters.get(name) instanceof Set)) {
      this.set(name, value);
    } else {
      const existing: TermsQueryFilter = (this._filters.get(name) || []) as TermsQueryFilter;
      const added: TermsQueryFilter = this._normalize(value as TermsFilterInputValue);
      this._filters.set(name, new Set([...existing, ...added]));
    }
  }

  public remove(name: string, value?: FilterInputValue) {
    const filter = this._filters.get(name);
    if (filter instanceof Set && value != null) {
      for (const term of this._normalizeTerms(value as TermsFilterInputValue)) {
        filter.delete(term);
      }
    } else {
      // no value passed or value is an object
      // TODO: should delete only if is shallow equal???
      this._filters.delete(name);
    }
  }

  public toggle(name: string, value: FilterInputValue | unknown) {
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

  public clear() {
    this._filters.clear();
  }

  public setMany(data: GenericObject<FilterInputValue>, replace = false) {
    if (replace) {
      this.clear();
    }
    for (const key in data) {
      this.set(key, data[key]);
    }
  }

  public dump() {
    const data: GenericObject<FilterInputValue> = {};
    this._filters.forEach((value, key) => {
      data[key] = this._denormalize(value);
    });
    if (Object.keys(data).length > 0) {
      return data;
    }
  }

  private _isTerm(value: any): boolean {
    return typeof value === 'string' || typeof value === 'number';
  }

  private _isTermsArray(value: any): boolean {
    return Array.isArray(value) && value.filter(this._isTerm).length === value.length;
  }

  private _normalize(value: any): QueryFilterValue | any {
    if (this._isTerm(value)) {
      return new Set([value]);
    } else if (this._isTermsArray(value)) {
      return new Set(value);
    } else {
      return value;
    }
  }

  private _denormalize(value: QueryFilterValue | unknown): FilterInputValue | unknown {
    return value instanceof Set ? [...value] : value;
  }

  private _filterContainsOrEqualsValue(
    name: string,
    value: FilterInputValue | unknown,
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

  private _normalizeTerms(value: TermsFilterInputValue): TermsQueryFilter {
    return new Set(Array.isArray(value) ? value : [value]);
  }
}
