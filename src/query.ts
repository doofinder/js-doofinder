import { GenericObject } from './types';
import { isPlainObject, shallowEqual, isString } from './util/is';
import { clone } from './util/clone';
import { validateHashId, validatePage, validateRpp, ValidationError } from './util/validators';

// filters

export interface RangeFilter {
  lte?: number;
  gte?: number;
  lt?: number;
  gt?: number;
}

export interface GeoDistance {
  [field: string]: string;
  distance: string;
}

// filters: internal

export type TermsFilter = Set<string | number>;

export type DataTypeSet = Set<string>;

export type Filter = TermsFilter | RangeFilter | GeoDistance;

// filters: external

export type TermsFilterValue = string | number | string[] | number[];

/**
 * All the possibles values to assign to the Filter.
 */
export type FilterValue = TermsFilterValue | RangeFilter | GeoDistance;

// sorting

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

// exceptions

export class QueryValueError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = 'QueryValueError';
  }
}

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
  filter: GenericObject<FilterValue>;
  exclude: GenericObject<FilterValue>;
  // sort parameters
  sort: SortingInput[];
  // items
  items: string[];
  // custom parameters
  [key: string]: any;
}

export type QueryParams = Partial<QueryParamsSpec>;

/**
 * Manage filters applied to a query.
 * @beta
 */
export class QueryFilter {
  private _filters: Map<string, Filter> = new Map();

  public get(name: string): FilterValue | unknown {
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
  public set(name: string, value: FilterValue | unknown): void {
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

  public contains(name: string, value: FilterValue | unknown): boolean {
    return this.has(name) && this._filterContainsOrEqualsValue(name, value, false);
  }

  public equals(name: string, value: FilterValue | unknown): boolean {
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
  public add(name: string, value: FilterValue | unknown): void {
    if (!(this._filters.get(name) instanceof Set)) {
      this.set(name, value);
    } else {
      const existing: TermsFilter = (this._filters.get(name) || []) as TermsFilter;
      const added: TermsFilter = this._normalize(value as TermsFilterValue);
      this._filters.set(name, new Set([...existing, ...added]));
    }
  }

  public remove(name: string, value?: FilterValue) {
    const filter = this._filters.get(name);
    if (filter instanceof Set && value != null) {
      for (const term of this._normalizeTerms(value as TermsFilterValue)) {
        filter.delete(term);
      }
    } else {
      // no value passed or value is an object
      // TODO: should delete only if is shallow equal???
      this._filters.delete(name);
    }
  }

  public toggle(name: string, value: FilterValue | unknown) {
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

  public setMany(data: GenericObject<FilterValue>, replace = false) {
    if (replace) {
      this.clear();
    }
    for (const key in data) {
      this.set(key, data[key]);
    }
  }

  public dump() {
    const data: GenericObject<FilterValue> = {};
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

  private _normalize(value: any): Filter | any {
    if (this._isTerm(value)) {
      return new Set([value]);
    } else if (this._isTermsArray(value)) {
      return new Set(value);
    } else {
      return value;
    }
  }

  private _denormalize(value: Filter | unknown): FilterValue | unknown {
    return value instanceof Set ? [...value] : value;
  }

  private _filterContainsOrEqualsValue(name: string, value: FilterValue | unknown, checkEquality: boolean): boolean {
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

  private _normalizeTerms(value: TermsFilterValue): TermsFilter {
    return new Set(Array.isArray(value) ? value : [value]);
  }
}

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

    if ('items' in data && 'query' in data) {
      throw new ValidationError(`provide either query or items but not both`);
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

  public setParam(name: keyof QueryParams, value: unknown): void {
    if (typeof value !== 'undefined') {
      if (name === 'hashid') {
        validateHashId(value as string);
      } else if (name === 'page') {
        validatePage(value as number);
      } else if (name === 'rpp') {
        validateRpp(value as number);
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
