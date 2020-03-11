import { QueryValueError } from './error';

import { clone } from '../util/clone';
import { isPlainObject } from '../util/is';

export type SortOrder = 'asc' | 'desc';

export interface GeoSortOrder {
  [field: string]: string;
  order: SortOrder;
}

// is this _geo_distance instead???
export interface GeoSorting {
  geo_distance: GeoSortOrder;
}

export interface FieldSorting {
  [field: string]: SortOrder;
}

export type Sorting = FieldSorting | GeoSorting;

export type SortingInput = string | Sorting;

export class QuerySort {
  private _sortings: Sorting[] = [];

  public set(value: SortingInput | SortingInput[]): number {
    this.clear();
    (Array.isArray(value) ? value : [value]).forEach(sorting => {
      if (typeof sorting === 'string') {
        this.add({ [sorting]: 'asc' });
      } else {
        this.add(sorting);
      }
    });
    return this._sortings.length;
  }

  public add(value: FieldSorting | GeoSorting): number;
  public add(value: string, order?: SortOrder): number;
  public add(value: string | SortingInput, order?: SortOrder): number {
    if (typeof value === 'string') {
      return this._addFieldSorting(value, order);
    } else if (this._isLikeSorting(value)) {
      const field: string = Object.keys(value)[0];
      if (field === 'geo_distance') {
        return this._addGeoDistanceSorting(clone(value[field]) as GeoSortOrder);
      } else {
        return this._addFieldSorting(field, (value as FieldSorting)[field]);
      }
    }
  }

  public get(): Sorting[] {
    return clone(this._sortings);
  }

  public clear(): void {
    this._sortings.length = 0;
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
        return this._sortings.push({ geo_distance: value } as GeoSorting);
      }
    }

    throw new QueryValueError(`wrong sorting value for 'geo_distance': ${JSON.stringify(value)}`);
  }
}
