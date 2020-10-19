import { QueryValueError } from './error';

import { clone } from '../util/clone';
import { isPlainObject } from '../util/is';

/**
 * Valid sort order values.
 * @public
 */
export type SortOrder = 'asc' | 'desc';

/**
 * Specification to sort by geo distance.
 * @public
 */
export interface GeoSortOrder {
  /** A geo point field, the value is a valid position. */
  [field: string]: string;
  /** How to sort relative to the provided geo point (asc or desc) */
  order: SortOrder;
}

/**
 * Interface to specify a sorting by geo distance.
 * @public
 */
export interface GeoSorting {
  /**
   * The geo distance sorting info.
   * @public
   */
  _geo_distance: GeoSortOrder;
}

/**
 * Specification to sort by a field.
 * @public
 */
export interface FieldSorting {
  /** A regular field and the sort direction. */
  [field: string]: SortOrder;
}

/**
 * A field or geo distance sorting.
 * @public
 */
export type Sorting = FieldSorting | GeoSorting;

/**
 * Valid input for a field or geo distance sorting.
 * @public
 */
export type SortingInput = string | Sorting;

/**
 * Class to manage sorting information for a search query.
 * @public
 */
export class QuerySort {
  private _sortings: Sorting[] = [];

  /**
   * Set one or more values to sort the query.
   *
   * @param value - Field name to sort the query.
   * @param order - Order of the sorting.
   * @returns the new length of the list of sortings.
   *
   * @public
   */
  public set(value: string, order?: SortOrder): number;
  /**
   * Set one or more values to sort the query.
   *
   * @param value - Object describing the sorting.
   * @returns the new length of the list of sortings.
   *
   * @public
   */
  public set(value: Sorting): number;
  /**
   * Set one or more values to sort the query.
   *
   * @param value - Array of objects describing the sorting.
   * @returns the new length of the list of sortings.
   *
   * @public
   */
  public set(value: SortingInput[]): number;
  public set(value: string | Sorting | SortingInput[], order?: SortOrder): number {
    this.clear();
    if (typeof value === 'string') {
      this.add(value, order);
    } else {
      (Array.isArray(value) ? value : [value]).forEach(sorting => {
        if (typeof sorting === 'string') {
          this.add({ [sorting]: 'asc' });
        } else {
          this.add(sorting);
        }
      });
    }
    return this._sortings.length;
  }

  /**
   * Add a sorting to the end of the list of sortings.
   *
   * @param value - A field name as string.
   * @param order - The order of the sorting.
   * @returns the new length of the list of sortings.
   *
   * @public
   */
  public add(value: string, order?: SortOrder): number;
  /**
   * Add a sorting to the end of the list of sortings.
   *
   * @param value - A valid input sorting value.
   * @returns the new length of the list of sortings.
   *
   * @public
   */
  public add(value: FieldSorting | GeoSorting): number;
  public add(value: SortingInput, order?: SortOrder): number {
    if (typeof value === 'string') {
      return this._addFieldSorting(value, order);
    } else if (this._isLikeSorting(value)) {
      const field: string = Object.keys(value)[0];
      if (field === '_geo_distance') {
        return this._addGeoDistanceSorting(clone(value[field]) as GeoSortOrder);
      } else {
        return this._addFieldSorting(field, (value as FieldSorting)[field]);
      }
    }
  }

  /**
   * Get the current list of sortings.
   * @returns An array of sort values.
   * @public
   */
  public get(): Sorting[] {
    return clone(this._sortings);
  }

  /**
   * Clear the current list of sortings.
   * @public
   */
  public clear(): void {
    this._sortings.length = 0;
  }

  /**
   * Get if certain FieldSorting is being used to sort.
   * @public
   */
  public has(value: FieldSorting): Boolean {
    return this._sortings.includes(value);
  }

  private _isLikeSorting(value: Sorting): boolean {
    return isPlainObject(value) && Object.keys(value).length === 1;
  }

  private _addFieldSorting(field: string, order: SortOrder = 'asc'): number {
    if (['asc', 'desc'].includes(order)) {
      return this._sortings.push({ [field]: order });
    }

    throw new QueryValueError(`wrong sorting value for field '${field}': ${JSON.stringify(order)}`);
  }

  private _addGeoDistanceSorting(value: GeoSortOrder): number {
    if (isPlainObject(value) && Object.keys(value).length === 2 && 'order' in value) {
      const field: string = Object.keys(value).find(key => key !== 'order');
      if (typeof value[field] === 'string') {
        // eslint-disable-next-line @typescript-eslint/camelcase
        return this._sortings.push({ _geo_distance: value } as GeoSorting);
      }
    }

    throw new QueryValueError(`wrong sorting value for 'geo_distance': ${JSON.stringify(value)}`);
  }
}
