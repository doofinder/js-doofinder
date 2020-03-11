import { GenericObject } from '../types/base';
import { SortingInput, Sorting, FieldSorting, GeoSorting, SortOrder, GeoSortOrder } from '../types/request';

import { clone } from '../util/clone';
import { isPlainObject, isString } from '../util/is';
import { validateHashId, validatePage, validateRpp, validateItems } from '../util/validators';
import { QueryFilter, FilterInputValue } from './filter';
import { QueryValueError } from './error';

// exceptions

interface QueryParamsSpec {
  // basic parameters
  hashid: string;
  query: string;
  page: number;
  rpp: number;
  transformer: string;
  // dark magic parameters
  query_name: string;
  query_counter: number;
  nostats: boolean;
  type: string | string[];
  // filter parameters
  filter: GenericObject<FilterInputValue>;
  exclude: GenericObject<FilterInputValue>;
  // sort parameters
  sort: SortingInput[];
  // items
  items: string[];
  // custom parameters
  [key: string]: any;
}

export type QueryParams = Partial<QueryParamsSpec>;

export class QueryTypes {
  private _types: Set<string> = new Set();

  public set(value: string | string[]): void {
    const types = Array.isArray(value) ? value : [value];
    if (types.filter(isString).length === types.length) {
      this._types = new Set(types);
    } else {
      throw new QueryValueError(`types must be strings`);
    }
  }

  public dump(): string | string[] {
    return Array.from(this._types);
  }

  public clear(): void {
    this._types.clear();
  }

  public add(value: string): void {
    if (typeof value === 'string') {
      this._types.add(value);
    } else {
      throw new QueryValueError(`types must be strings`);
    }
  }

  public has(value: string): boolean {
    return this._types.has(value);
  }

  public remove(value: string) {
    this._types.delete(value);
  }
}

class QuerySort {
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

/**
 * Main QueryBuilder interface, allows creating programmaticly
 * the query using methods instead of creating the JSON and
 * parameters by hand, and doing the searches in a deferred
 * mode
 *
 */
export class Query {
  private _defaults: QueryParams;
  private _params: QueryParams;
  private _types: QueryTypes;
  private _filters: QueryFilter;
  private _excludes: QueryFilter;
  private _sort: QuerySort;

  public get defaults(): QueryParams {
    return this._defaults;
  }
  public set defaults(value: QueryParams) {
    this._defaults = clone(value);
    this.reset();
  }

  public constructor(params: QueryParams = {}) {
    this._defaults = {
      query: '',
      page: 1,
      rpp: 20,
    };
    this._types = new QueryTypes();
    this._filters = new QueryFilter();
    this._excludes = new QueryFilter();
    this._sort = new QuerySort();
    this.reset();
    this.load(params);
  }

  public reset(): void {
    this._types.clear();
    this._filters.clear();
    this._excludes.clear();
    this._sort.clear();
    this._params = {};
    this.load(clone(this.defaults));
  }

  public load(params: QueryParams = {}) {
    Object.keys(params).forEach(key => {
      if (key === 'nostats') {
        this.noStats = !!params.nostats;
      } else if (key === 'filter') {
        this._filters.setMany(params.filter);
      } else if (key === 'exclude') {
        this._excludes.setMany(params.exclude);
      } else if (key === 'type') {
        this._types.set(params.type);
      } else if (key === 'sort') {
        this._sort.set(params.sort);
      } else {
        this.setParam(key, params[key]);
      }
    });
  }

  public dump(validate = false): QueryParams {
    if (validate) {
      validateHashId(this.hashid);
      validatePage(this.page);
      validateRpp(this.rpp);
    }

    const data: QueryParams = {
      ...clone(this._params),
      type: this.types.dump(),
      filter: this.filters.dump(),
      exclude: this.excludes.dump(),
      sort: this.sort.get(),
    };

    ['nostats', 'filter', 'exclude'].forEach(key => {
      if (!data[key]) delete data[key];
    });

    ['type', 'sort'].forEach(key => {
      if (data[key].length === 0) delete data[key];
    });

    if ('items' in data) {
      if (data.items.length > 0) {
        delete data.query;
      } else {
        delete data.items;
      }
    }

    return data;
  }

  public copy(): Query {
    const query = new Query();
    query.defaults = clone(this.defaults);
    query.reset();
    query.load(this.dump());
    return query;
  }

  /**
   * Retrieve the value of a given parameter.
   *
   * @param name - Name of the parameter to retrieve
   * @returns the value of the parameter, if any
   * @beta
   */
  public getParam(name: keyof QueryParams): any {
    return this._params[name];
  }

  public setParam(name: keyof QueryParams, value?: unknown): void {
    if (typeof value !== 'undefined') {
      if (name === 'hashid') {
        validateHashId(value as string);
      } else if (name === 'page') {
        validatePage(value as number);
      } else if (name === 'rpp') {
        validateRpp(value as number);
      } else if (name === 'items') {
        validateItems(value);
      }

      this._params[name] = value;
    } else {
      delete this._params[name];
    }
  }

  // basic parameters

  public get hashid(): string {
    return this.getParam('hashid');
  }
  public set hashid(value: string) {
    this.setParam('hashid', value);
  }

  public get text(): string {
    return this.getParam('query');
  }
  public set text(value: string) {
    this.setParam('query', value);
  }

  public get items(): string[] {
    return this.getParam('items');
  }
  public set items(value: string[]) {
    this.setParam('items', value);
  }

  public get page(): number {
    return this.getParam('page');
  }
  public set page(value: number) {
    this.setParam('page', value);
  }

  public get rpp(): number {
    return this.getParam('rpp');
  }
  public set rpp(value: number) {
    this.setParam('rpp', value);
  }

  public get transformer(): string {
    return this.getParam('transformer');
  }
  public set transformer(value: string) {
    this.setParam('transformer', value);
  }

  // dark magic parameters

  public get queryName(): string {
    return this.getParam('query_name');
  }
  public set queryName(value: string) {
    this.setParam('query_name', value);
  }

  public get queryCounter(): number {
    // TODO: should this have a default value?
    return this.getParam('query_counter');
  }
  public set queryCounter(value: number) {
    if (isNaN(value)) {
      this.setParam('query_counter', undefined);
    } else {
      this.setParam('query_counter', value);
    }
  }

  public get noStats(): boolean {
    return !!this.getParam('nostats');
  }
  public set noStats(value: boolean) {
    this.setParam('nostats', !!value);
  }

  // types

  public get types(): QueryTypes {
    return this._types;
  }

  // filter parameters

  public get filters(): QueryFilter {
    return this._filters;
  }

  public get excludes(): QueryFilter {
    return this._excludes;
  }

  // sort parameters

  public get sort(): QuerySort {
    return this._sort;
  }
}
