import { QueryTypes } from './datatype';
import { QueryFilter } from './filter';
import { QuerySort, SortingInput, Sorting } from './sort';

import { clone } from '../util/clone';
import { validateHashId, validatePage, validateRpp, validateItems } from '../util/validators';

// exceptions

/**
 * Base parameters for a query.
 * @public
 */
export interface QueryParamsBase {
  // basic parameters

  /** Unique id of the search engine. */
  hashid: string;
  /** Search terms. */
  query?: string;
  /** Results page to retrieve. */
  page?: number;
  /** Number of results to retrieve for each page. */
  rpp?: number;
  /** Name of the transformer to use to normalize the results. */
  transformer?: string;

  // dark magic parameters

  /** Name of the query to use to get the results. */
  query_name?: string;
  /** Internal counter to manage request/response flow. */
  query_counter?: number;
  /** Whether to count the request in the search stats or not. */
  nostats?: boolean;
  /** Restrict the types of data to retrieve results. */
  type?: string | string[];

  // filter parameters

  /** Filters to include results in the response. */
  filter?: Record<string, any>;
  /** Filters to exclude results from the response. */
  exclude?: Record<string, any>;

  // sort parameters

  /** Parameters to sort the results */
  sort?: SortingInput[];

  // items
  /** List of dfids to be retrieved from the server. */
  items?: string[];

  // custom parameters
  /** Other custom parameters */
  [key: string]: unknown;
}

/**
 * Set of params that can be passed when creating a {@link Query}.
 * @public
 */
export type QueryParams = Partial<QueryParamsBase>;

/**
 * Set of params that are dump from a {@link Query}.
 * @public
 */
export interface SearchParams extends QueryParamsBase {
  type?: string[];
  sort?: Sorting[];
}

/**
 * Allows creating a search query programmatically instead of creating
 * the JSON and parameters by hand.
 * @public
 */
export class Query {
  private _defaults: QueryParams;
  private _params: Omit<QueryParams, 'exclude' | 'filter' | 'sort' | 'type'>;
  private _types: QueryTypes;
  private _filters: QueryFilter;
  private _excludes: QueryFilter;
  private _sort: QuerySort;

  /**
   * Get / set the default parameters set when the query is reset.
   * @public
   */
  public get defaults(): QueryParams {
    return this._defaults;
  }
  public set defaults(value: QueryParams) {
    this._defaults = clone(value);
    this.reset();
  }

  /**
   * Constructor.
   *
   * @param params - Initial parameters to load for this query.
   * @public
   */
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

  /**
   * Reset the current query to the defaults.
   * @public
   */
  public reset(): void {
    this._types.clear();
    this._filters.clear();
    this._excludes.clear();
    this._sort.clear();
    this._params = {};
    this.load(clone(this.defaults));
  }

  /**
   * Configure the query with the provided params.
   * @param params - Params to load.
   * @public
   */
  public load(params: QueryParams = {}): void {
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

  /**
   * Export the query as a params object.
   *
   * @param validate - Whether to validate the exported data or not.
   * @returns An object with all the parameters in the query.
   *
   * @public
   */
  public dump(validate = false): SearchParams {
    if (validate) {
      validateHashId(this.hashid);
      validatePage(this.page);
      validateRpp(this.rpp);
    }

    const data: SearchParams = {
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
      if ((data[key] as unknown[]).length === 0) delete data[key];
    });

    if ('items' in data) {
      if (data.items.length > 0) {
        const { page, rpp } = data;

        delete data.query;
        delete data.page;
        delete data.rpp;

        data.items = data.items.slice((page - 1) * rpp, page * rpp);
      } else {
        delete data.items;
      }
    }

    return data;
  }

  /**
   * Create a copy of the current query.
   * @returns A new instance of Query.
   * @public
   */
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
   * @public
   */
  public getParam(name: keyof QueryParams): unknown {
    return this._params[name];
  }

  /**
   * Set the value of a given parameter.
   *
   * @remarks
   *
   * If the value is `undefined` the parameter is removed.
   *
   * @param name - Name of the parameter to set.
   * @param value - The value of the parameter.
   * @public
   */
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

  /**
   * Get / set the `hashid` parameter.
   * @param value - The hashid as string.
   * @public
   */
  public get hashid(): string {
    return this.getParam('hashid') as string;
  }
  public set hashid(value: string) {
    this.setParam('hashid', value);
  }

  /**
   * Get / set the `query` parameter.
   * @param value - The query as string.
   * @public
   */
  public get text(): string {
    return this.getParam('query') as string;
  }
  public set text(value: string) {
    this.setParam('query', value);
  }

  /**
   * Get / set the `items` parameter.
   * @param value - The items as an array of strings.
   * @public
   */
  public get items(): string[] {
    return this.getParam('items') as string[];
  }
  public set items(value: string[]) {
    this.setParam('items', value);
  }

  /**
   * Get / set the `page` parameter.
   * @param value - The page as a number.
   * @public
   */
  public get page(): number {
    return this.getParam('page') as number;
  }
  public set page(value: number) {
    this.setParam('page', value);
  }

  /**
   * Get / set the `rpp` parameter.
   * @param value - The rpp as a number.
   * @public
   */
  public get rpp(): number {
    return this.getParam('rpp') as number;
  }
  public set rpp(value: number) {
    this.setParam('rpp', value);
  }

  /**
   * Get / set the `transformer` parameter.
   * @param value - The transformer as string.
   * @public
   */
  public get transformer(): string {
    return this.getParam('transformer') as string;
  }
  public set transformer(value: string) {
    this.setParam('transformer', value);
  }

  // dark magic parameters

  /**
   * Get / set the `query_name` parameter.
   * @param value - The query name as string.
   * @public
   */
  public get queryName(): string {
    return this.getParam('query_name') as string;
  }
  public set queryName(value: string) {
    this.setParam('query_name', value);
  }

  /**
   * Get / set the `query_counter` parameter.
   * @param value - The query counter as a number.
   * @public
   */
  public get queryCounter(): number {
    // TODO: should this have a default value?
    return this.getParam('query_counter') as number;
  }
  public set queryCounter(value: number) {
    if (isNaN(value)) {
      this.setParam('query_counter', undefined);
    } else {
      this.setParam('query_counter', value);
    }
  }

  /**
   * Get / set the `nostats` parameter.
   * @param value - The nostats as boolean.
   * @public
   */
  public get noStats(): boolean {
    return !!this.getParam('nostats');
  }
  public set noStats(value: boolean) {
    this.setParam('nostats', !!value);
  }

  // types

  /**
   * Return the instance of the query types manager for the current query.
   * @public
   */
  public get types(): QueryTypes {
    return this._types;
  }

  // filter parameters

  /**
   * Return the instance of the query filters manager for the current query.
   * @public
   */
  public get filters(): QueryFilter {
    return this._filters;
  }

  /**
   * Return the instance of the query excludes manager for the current query.
   * @public
   */
  public get excludes(): QueryFilter {
    return this._excludes;
  }

  // sort parameters

  /**
   * Return the instance of the sort manager for the current query.
   * @public
   */
  public get sort(): QuerySort {
    return this._sort;
  }
}
