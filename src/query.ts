import { DoofinderParameters, FacetOption, SearchParameters, GenericObject } from './types';
import { isPlainObject, isArray, isEmptyObject } from './util/is';

/**
 * Values available for the sorting options
 * TODO: If this is not used in the response, move to request.ts
 */
export enum OrderType {
  ASC = 'asc',
  DESC = 'desc',
}

export interface RangeFilter {
  lte?: number;
  gte?: number;
  lt?: number;
  gt?: number;
}

export interface GeoDistanceFilter {
  distance: string;
  position: string;
}

export type TermsFilter = Set<string | number>;

export type DataTypes = Set<string>;

export type Filter = Map<string, TermsFilter | RangeFilter | GeoDistanceFilter>;

export type InputTermsFilterValue = string | number | string[] | number[];

/**
 * All the possibles values to assign to the Filter.
 */
export type InputFilterValue = InputTermsFilterValue | RangeFilter | GeoDistanceFilter;

export type InputExtendedSort = {
  [key: string]: 'asc' | 'desc';
};

export type InputSort = string | InputExtendedSort;

export type Sort = Map<string, OrderType>;

export class QueryValueError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = 'QueryValueError';
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
  public hashid: string = null;
  public text: string;
  public queryCounter: number = null;
  private params: GenericObject = {};
  private _filters: Filter = new Map();
  private _exclusionFilters: Filter = new Map();
  private _sort: Sort = new Map();
  private _rpp?: number;
  private _page?: number;
  private _transformer?: string;
  private _dataTypes?: DataTypes;
  private _noStats?: 0 | 1;
  private _queryName?: string;
  private _timeout: number;
  private _jsonp: boolean;
  private _initialConfig: GenericObject;

  public get filters(): GenericObject {
    return this._getFilter(this._filters);
  }

  public get exclusionFilters(): GenericObject {
    return this._getFilter(this._exclusionFilters);
  }

  public get getSort(): InputExtendedSort[] {
    const results: InputExtendedSort[] = [];
    this._sort.forEach((ordering, field) => results.push({ [field]: ordering }));
    return results;
  }

  public constructor(initialConfig?: GenericObject) {
    this._initialConfig = initialConfig;
    if (initialConfig) {
      this.load(initialConfig);
    }
  }

  /**
   * Sets the query string to make a search
   *
   * NOTE: This does not search, just sets the parameter
   *
   * @param  {String}   query   The search query to be sent.
   *
   */
  public searchText(query: string): Query {
    this.text = query;
    return this;
  }

  /**
   * This method adds a concrete filter to the current search request.
   *
   * @param filterName  The name of the filter to set
   * @param value       The value to set the filter to
   *                                    (several can be added to the same filter)
   *
   */
  public addFilter(filterName: string, value: InputFilterValue): Query {
    return this._addFilter(this._filters, filterName, value);
  }

  /**
   * Add an exclude filter to the query instance.
   *
   * @param filterName  The name of the exclude filter
   * @param value       The value to add to the exclude filter
   */
  public addExcludeFilter(filterName: string, value: InputFilterValue): Query {
    return this._addFilter(this._exclusionFilters, filterName, value);
  }

  /**
   * This method removes a given included filter to the current search request.
   *
   * @param filterName  The name of the filter to modify
   * @param value       The value to remove from the filter
   */
  public removeFilter(filterName: string, value: InputFilterValue): Query {
    this._removeFilter(this._filters, filterName, value);
    return this;
  }

  /**
   * This method removes a given excluded filter to the current search request.
   *
   * @param filterName  The name of the filter to modify
   * @param value       The value to remove from the filter
   */
  public removeExclusionFilter(filterName: string, value: InputFilterValue): Query {
    this._removeFilter(this._exclusionFilters, filterName, value);
    return this;
  }

  /**
   * This method allows to check if a given filter is set in the current search
   * request
   *
   * @param  filterName - The name of the filter to modify
   * @param  value - (Optional) The value to check from
   *                                         the filter
   * @return  True or False depending if the filter is set for the given value
   *          or there's a filter set with any value
   */
  public hasFilter(filterName: string, value?: string): boolean {
    return this._hasFilter(this._filters, filterName, value);
  }

  public hasExclusionFilter(filterName: string, value?: string): boolean {
    return this._hasFilter(this._exclusionFilters, filterName, value);
  }

  /**
   * Toggles a filter value from the given filter in the given context
   *
   * @param  filterName - The name of the filter to modify
   * @param  value - The value to remove from the filter
   */
  public toggleFilter(filterName: string, value: FacetOption | string | number): void {
    let values: Array<RangeFilter | string | number> = [];

    if (Array.isArray(value)) {
      values = value;
    } else if (typeof value === 'string' || typeof value === 'number' || isPlainObject(value)) {
      values = [value];
    }

    (values as Array<unknown>).forEach((value: any) => {
      if (this.hasFilter(filterName, value)) {
        this.removeFilter(filterName, [value]);
      } else {
        this.addFilter(filterName, [value]);
      }
    });
  }

  public toggleExclusionFilter(filterName: string, value: FacetOption | string | number): void {
    let values: Array<RangeFilter | string | number> = [];

    if (Array.isArray(value)) {
      values = value;
    } else if (typeof value === 'string' || typeof value === 'number' || isPlainObject(value)) {
      values = [value];
    }

    (values as Array<unknown>).forEach((value: any) => {
      if (this.hasExclusionFilter(filterName, value)) {
        this.removeExclusionFilter(filterName, [value]);
      } else {
        this.addExcludeFilter(filterName, [value]);
      }
    });
  }

  /**
   * Overwrites the parameters with the object given, allowing
   * to change in one call several parameters
   *
   * @param parameters - Parameters with the query definition
   */
  public load(parameters: SearchParameters): void {
    this.params = Object.assign({}, this.params, this._hydrate(parameters));
    if ('hashid' in this.params) {
      this.hashid = this.params.hashid;
      delete this.params['hashid'];
    }
    if ('filter' in this.params) {
      for (const field in this.params.filter) {
        this.addFilter(field, this.params['filter'][field] as InputFilterValue);
      }
      delete this.params['filter'];
    }
    if ('sort' in this.params) {
      this.sort(this.params['sort']);
      delete this.params['sort'];
    }
    if ('rpp' in this.params) {
      this.rpp(this.params['rpp']);
      delete this.params['rpp'];
    }
    if ('page' in this.params) {
      this.page(this.params['page']);
      delete this.params['page'];
    }
    if ('transformer' in this.params) {
      this.transformer(this.params['transformer']);
      delete this.params['transformer'];
    }
    if ('type' in this.params) {
      this.types(this.params['type']);
      delete this.params['type'];
    }
    if ('nostats' in this.params) {
      this.noStats(this.params['nostats']);
      delete this.params['nostats'];
    }
    if ('query_name' in this.params) {
      this.queryName(this.params['query_name']);
      delete this.params['query_name'];
    }
    if ('timeout' in this.params) {
      this.timeout(this.params['timeout']);
      delete this.params['timeout'];
    }
    if ('jsonp' in this.params) {
      this.jsonp(this.params['jsonp']);
      delete this.params['jsonp'];
    }
  }

  /**
   * @param fieldOrList - Field to use in sort. It cant be use as:
   *                        - string: 'price'
   *                        - list of definition: [{price: 'asc}, {name: 'desc'}]
   * @param sortType - Optional params in case of the first params is an string
   *                   and an order is needed to define
   */
  public sort(fieldOrList: InputSort[]): Query;
  public sort(fieldOrList: string, orderType?: string): Query;
  public sort(fieldOrList: string | InputSort[], orderType: string = OrderType.ASC): Query {
    if (typeof fieldOrList === 'string') {
      this._sort.clear();
      this._sort.set(fieldOrList, this._validateOrderType(orderType));
    } else if (isArray(fieldOrList)) {
      this._sort.clear();
      for (const value of fieldOrList) {
        if (typeof value === 'string') {
          this._sort.set(value, OrderType.ASC);
        } else {
          const field = Object.keys(value)[0];
          const orderType: string = Object.values(value)[0] as string;
          this._sort.set(field, this._validateOrderType(orderType));
        }
      }
    } else {
      throw new QueryValueError('Value error: Sort must be an string or a list of sort definitions');
    }
    return this;
  }

  public hasSorting(field: string): boolean {
    return this._sort.has(field);
  }

  /**
   * Sets the page value of the request, useful for pagination
   *
   * @param  page - The page we want to set
   *
   * @returns Query
   *
   */
  public page(page?: number): Query {
    if (typeof page === 'number' || typeof page === 'undefined' || typeof page === null) {
      this._page = page && page > 0 ? page : 1;
    } else {
      throw new QueryValueError('Value error: Page value must be a number');
    }
    return this;
  }

  /**
   * Advances the current page to the next one
   *
   */
  public nextPage(): void {
    this._page = (this._page || 1) + 1;
  }

  /**
   * Sets the Results Per Page (rpp) parameter.
   *
   * @param  rpp - The results per page to set
   *
   * @returns Query
   */
  public rpp(rpp?: number): Query {
    if ((typeof rpp === 'number' && 0 < rpp && rpp <= 100) || typeof rpp === 'undefined') {
      this._rpp = rpp;
    } else {
      throw new QueryValueError('Value error: Result per page must be a number > 0 and <= 100');
    }
    return this;
  }

  /**
   * Sets the types to query in this query, call without
   * parameters to clear the setting
   *
   * @param  types - The type or types to set for this query
   *
   * @returns Query
   */
  public types(types?: string | string[]): Query {
    if (types) {
      this._dataTypes = new Set();
      if (typeof types === 'string') {
        this._dataTypes.add(types);
      } else if (isArray(types)) {
        for (const type of types) {
          this._dataTypes.add(type);
        }
      } else {
        throw new QueryValueError('Value error: Types value must be string or array of strings');
      }
    } else {
      delete this._dataTypes;
    }
    return this;
  }

  /**
   * Sets the transformer, call it empty to reset it to null
   *
   * @param  transformer - The transformer option to set
   *
   * @returns Query
   */
  public transformer(transformer?: string | null): Query {
    if (transformer || transformer === null) {
      this._transformer = transformer;
    } else {
      delete this._transformer;
    }
    return this;
  }

  /**
   * Sets the timeout for the query, call it empty to reset
   *
   * @param  timeout - The timeoout for the call
   *
   */
  public timeout(timeout?: number): void {
    if ((typeof timeout === 'number' && timeout > 0) || typeof timeout == 'undefined') {
      this._timeout = timeout;
    } else {
      throw new QueryValueError('Value error: timeout must be a number > 0');
    }
  }

  /**
   * Allows to ask for jsonp format, call without parameters
   * to clear the flag
   *
   * @param  jsonp - Whether to use jsonp or not
   *
   */
  public jsonp(jsonp?: boolean): void {
    if (jsonp) {
      this._jsonp = jsonp;
    } else {
      delete this._jsonp;
    }
  }

  /**
   * Sets the query name for this query, call without parameters
   * to clear the value
   *
   * @param  {String}   queryName   The query_name parameter value to set
   *
   */
  public queryName(queryName?: string): Query {
    if (typeof queryName === 'string' || typeof queryName === 'undefined') {
      this._queryName = queryName;
    } else {
      throw new QueryValueError('Value error: queryname must be a string value');
    }
    return this;
  }

  /**
   * Sets the nostats flag, call without parameters to clear it
   *
   * @param - noStats   Wether to send the nostats flag or not
   *
   */
  public noStats(noStats?: boolean): Query {
    if (['boolean', 'undefined'].includes(typeof noStats)) {
      if (noStats) {
        this._noStats = 1;
      } else {
        delete this._noStats;
      }
    } else {
      throw new QueryValueError('Value error: noStats must be a boolean value');
    }
    return this;
  }

  /**
   * Gets an structure body parameters ready to be sent through a post
   * to the Doofinder Search API
   *
   * @return  {Object}
   *
   */
  public dump(): GenericObject {
    const dumpData: GenericObject = JSON.parse(JSON.stringify(this.params));

    if (this.hashid) {
      dumpData.hashid = this.hashid;
    }
    dumpData.query = this.text ? this.text : '';
    if (!isEmptyObject(this._filters)) {
      dumpData.filter = this._getFilter(this._filters);
    }
    if (!isEmptyObject(this._exclusionFilters)) {
      dumpData.excludedFilters = this._getFilter(this._exclusionFilters);
    }
    const sort = this.getSort;
    if (!isEmptyObject(sort)) {
      dumpData.sort = sort;
    }
    if (this._rpp) {
      dumpData.rpp = this._rpp;
    }
    if (this._page) {
      dumpData.page = this._page;
    }
    if (typeof this._transformer !== 'undefined') {
      dumpData.transformer = this._transformer ? this._transformer : '';
    }
    if (this._dataTypes) {
      dumpData.type = [...this._dataTypes];
    }
    if (this._noStats) {
      dumpData.nostats = this._noStats;
    }
    if (this._queryName) {
      dumpData.query_name = this._queryName;
    }
    if (this._timeout) {
      dumpData.timeout = this._timeout;
    }
    if (this._jsonp) {
      dumpData.jsonp = this._jsonp;
    }
    return dumpData;
  }
  public reset(): void {
    this.hashid = null;
    this.text = '';
    this.queryCounter = null;
    this.params = {};
    this._filters = new Map();
    this._exclusionFilters = new Map();
    this._sort = new Map();
    if (this._rpp !== undefined) {
      delete this['_rpp'];
    }
    if (this._page !== undefined) {
      delete this['_page'];
    }
    if (this._transformer !== undefined) {
      delete this['_transformer'];
    }
    if (this._dataTypes !== undefined) {
      delete this['_dataTypes'];
    }
    if (this._noStats !== undefined) {
      delete this['_noStats'];
    }
    if (this._queryName !== undefined) {
      delete this['_queryName'];
    }
    if (this._timeout !== undefined) {
      delete this['_timeout'];
    }
    if (this._jsonp !== undefined) {
      delete this['_jsonp'];
    }
    if (this._initialConfig) {
      this.load(this._initialConfig);
    }
  }

  private _hydrate(params: SearchParameters): SearchParameters {
    // Filter nulls
    Object.keys(params).forEach((key: string) => {
      if (!params[key]) {
        delete params[key];
      }
    });
    return params;
  }

  private _addListFilterValue(filter: Filter, filterName: string, values: string[]): void {
    if (filter.has(filterName)) {
      for (const value of values) {
        (filter.get(filterName) as TermsFilter).add(value);
      }
    } else {
      filter.set(filterName, new Set([...values]));
    }
  }

  private _addObjectFilter(filter: Filter, filterName: string, value: RangeFilter | GeoDistanceFilter): void {
    // TODO: implement current validations.
    filter.set(filterName, value);
  }

  private _getFilter(filter: Filter): GenericObject {
    const result: GenericObject = {};
    filter.forEach((value, key) => {
      if (value instanceof Set) {
        result[key] = [...value];
      } else {
        result[key] = value;
      }
    });
    return result;
  }

  private _addFilter(filter: Filter, filterName: string, value: InputFilterValue): Query {
    if (typeof value === 'string' || typeof value === 'number') {
      value = [`${value}`];
    }

    if (isArray(value)) {
      this._addListFilterValue(filter, filterName, value as string[]);
    } else if (isPlainObject(value)) {
      this._addObjectFilter(filter, filterName, value as RangeFilter | GeoDistanceFilter);
    } else {
      throw new QueryValueError('Value error: Error in filter definition value');
    }
    return this;
  }

  private _removeFilter(filter: Filter, filterName: string, value: InputFilterValue): void {
    if (filter.has(filterName)) {
      const filterElement = filter.get(filterName);
      if (filterElement instanceof Set || typeof value === 'string' || typeof value === 'number') {
        this._removeTermFilterValue(filterElement as TermsFilter, value as InputTermsFilterValue);
      } else {
        filter.delete(filterName);
      }
    }
  }

  private _removeTermFilterValue(filterElement: TermsFilter, value: InputTermsFilterValue): void {
    if (typeof value === 'string' || typeof value === 'number') {
      filterElement.delete(value);
    } else {
      for (const subValue of value) {
        filterElement.delete(subValue);
      }
    }
  }

  private _hasFilter(filter: Filter, filterName: string, value?: string): boolean {
    // This returns true if the filter is a range, we don't compare
    return (
      filter.has(filterName) &&
      (!value || isPlainObject(filter.get(filterName)) || (filter.get(filterName) as TermsFilter).has(value))
    );
  }

  private _validateOrderType(orderType: string): OrderType {
    if (orderType.toLowerCase() === OrderType.ASC) {
      return OrderType.ASC;
    } else if (orderType.toLowerCase() === OrderType.DESC) {
      return OrderType.DESC;
    } else {
      throw new QueryValueError('Value error: Sort type must be: "asc" or "desc"');
    }
  }
}
