import { QueryFilter } from './filter';
import { QuerySort, SortingInput } from './sort';
import { QueryIndices } from './indices';

import { clone } from '../util/clone';
import { validateHashId, validatePage, validateRpp } from '../util/validators';
import { filterExecution } from '../enum/filterExecution';

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
  page?: string | number;
  /** Number of results to retrieve for each page. */
  rpp?: string | number;

  // dark magic parameters

  /** Name of the query to use to get the results. */
  query_name?: string;
  /** Whether to count the request in the search stats or not. */
  stats?: boolean;
  /** Your search engine is composed by one or many Indices. With the indices parameter you can specify to search within one specific Index. If this parameter is not provided, the search will work with all Indices. */
  indices?: string[];
  /** Aggregates fields values in a facet, you could use a term facet or range facet. */
  facets?: FacetQuery[];

  // filter parameters

  /** Filters to include results in the response. */
  filter?: Record<string, any>;
  /** Filters to exclude results from the response. */
  exclude?: Record<string, any>;
  /** Enable/Disable excluded items feature in the search. Default: true */
  excluded_results?: boolean;
  /** Filters are applied with "and" boolean logic than means that all filters conditions should be met. If you want to apply any of the filters conditions, you can change it to "or". */
  filter_execution?: filterExecution;

  // sort parameters

  /** Parameters to sort the results */
  sort?: SortingInput[];

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
 * Set of params that are dumped from a {@link Query}.
 * @public
 */
export interface SearchParams extends QueryParamsBase {
  /** Enable/Disable auto filters feature in search. Default: false */
  auto_filters?: boolean;

  /** Enable/Disable custom_results feature in search. Default: true */
  custom_results?: boolean;

  /** Enable/Disable the grouping of variants as single items. If not given, it's taken from the configuration set in the admin. */
  grouping?: boolean;

  /** A list of fields to be skipped from auto_filters feature. */
  skip_auto_filters?: string[];

  /** A list of fields to be skipped from top_facet feature. */
  skip_top_facet?: string[];

  /** Enable/Disable title_facet feature. Default: false */
  title_facet?: boolean;

  /** Enable/Disable top_facet feature. Default: false */
  top_facet?: boolean;
}

/**
 * Set of params that are dumped from a {@link Query}.
 * @public
 */
export interface SearchImageParams extends QueryParamsBase {
  image: string;
}

/**
 * Set of params that are dumped from a {@link Query}.
 * @public
 */
export interface FacetQuery {
  /** That is the field name that you want to aggregate results. */
  field?: string;

  /** The number of results to return in each field. Only applicable to facet terms. Maximum: 50 by default to help maintaining the speed of the search function */
  size?: string;

  /** The facet type. Indicates the type of the facet, one of term or range.It will return an error if the facet type is not correct. */
  term?: string;
}

/**
 * Allows creating a search query programmatically instead of creating
 * the JSON and parameters by hand.
 * @public
 */
export class Query {
  private _defaults: QueryParams;
  private _params: Omit<QueryParams, 'exclude' | 'filter' | 'sort' | 'indices'>;
  private _indices: QueryIndices;
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
    this._indices = new QueryIndices();
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
    this._indices.clear();
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
      if (key === 'filter') {
        this._filters.setMany(params.filter);
      } else if (key === 'exclude') {
        this._excludes.setMany(params.exclude);
      } else if (key === 'indices') {
        this._indices.set(params.indices);
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
      indices: this.indices.dump(),
      filter: this.filters.dump(),
      exclude: this.excludes.dump(),
      sort: this.sort.get(),
    };

    ['filter', 'exclude'].forEach(key => {
      if (!data[key]) delete data[key];
    });

    ['indices', 'sort'].forEach(key => {
      if ((data[key] as unknown[]).length === 0) delete data[key];
    });

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
        this._params.hashid = validateHashId(value as string);
      } else if (name === 'page') {
        this._params.page = validatePage(value);
      } else if (name === 'rpp') {
        this._params.rpp = validateRpp(value);
      } else {
        this._params[name] = value;
      }
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

  // indices

  /**
   * Return the instance of the query indices manager for the current query.
   * @public
   */
  public get indices(): QueryIndices {
    return this._indices;
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
