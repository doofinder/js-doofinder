import { GenericObject } from '../types/base';

import { QueryFilter, FilterInputValue } from './filter';
import { QueryTypes } from './datatype';

import { clone } from '../util/clone';
import { validateHashId, validatePage, validateRpp, validateItems } from '../util/validators';
import { QuerySort, SortingInput } from './sort';

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

/**
 * Main QueryBuilder interface, allows creating programmaticly
 * the query using methods instead of creating the JSON and
 * parameters by hand, and doing the searches in a deferred
 * mode
 *
 */
export class Query {
  private _defaults: QueryParams;
  private _params: Omit<QueryParams, 'exclude' | 'filter' | 'sort' | 'type'>;
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
