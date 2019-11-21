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

/**
 * The available transformer options
 */
export enum TransformerOptions {
  Basic = 'basic',
  OnlyID = 'onlyid',
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

export type InputExtendedSortValue = {
  [key: string]: 'asc' | 'desc';
};

export type InputSortValue = string | InputExtendedSortValue;

export type SortValue = Map<string, OrderType>;

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
  private params: SearchParameters = {};
  private _filters: Filter = new Map();
  private _exclusionFilters: Filter = new Map();
  private _sort: SortValue = new Map();
  private _rpp?: number;
  private _page?: number;
  private _transformer?: TransformerOptions;
  private _dataTypes?: DataTypes;
  private _noStats?: 0 | 1;
  private _queryName?: string;

  public constructor(hashid?: string | SearchParameters | Query) {
    if (typeof hashid === 'string') {
      this.hashid = hashid;
      this.params.hashid = this.hashid;
    } else if (hashid instanceof Query) {
      // Let's create a quick copy with this
      const params: SearchParameters = hashid.getParams();
      this.text = hashid.text;
      this.params = params;
    } else if (typeof hashid === 'object') {
      // It's a complete object to pass on
      if ('params' in hashid) {
        this.params = this._hydrate(hashid['params'] as SearchParameters);
      } else {
        this.params = this._hydrate(hashid);
      }
    }
  }

  public get filters(): GenericObject {
    return this._getFilter(this._filters);
  }

  public get excludedFilters(): GenericObject {
    return this._getFilter(this._exclusionFilters);
  }

  public get sort(): InputExtendedSortValue[] {
    const results: InputExtendedSortValue[] = [];
    this._sort.forEach((ordering, field) => results.push({ [field]: ordering }));
    return results;
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
   * Puts the query in an empty state
   *
   */
  public clear(): void {
    this.params = {};
    this.text = undefined;
    this._filters = new Map();
    this._exclusionFilters = new Map();
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
   * @param  {String}     filterName         The name of the filter to modify
   *
   * @param  {Any}        value              (Optional) The value to check from
   *                                         the filter
   *
   * @param  {String}     filterType         If we are adding a "filter" (default)
   *                                         or an "exclude" filter.
   *
   * @return  {Boolean}   The filter is set for the given value or there's a
   *                      filter set with any value
   *
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
   * @param  context      The context to affect
   * @param  filterName   The name of the filter to modify
   * @param  value        The value to remove from the filter
   * @param  filterType   If we are adding a "filter" (default) or an "exclude"
   *                      filter.
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
   * Allows to directly set a parameter on the query builder
   *
   */
  public setParameter(paramName: string, value: unknown): void {
    this.params[paramName] = value;
  }

  /**
   * Overwrites the parameters with the object given, allowing
   * to change in one call several parameters
   *
   */
  public setParameters(parameters: SearchParameters): void {
    this.params = Object.assign({}, this.params, this._hydrate(parameters));
    if ('sort' in this.params) {
      this.addSort(this.params['sort']);
      delete this.params['sort'];
    }
    if ('rpp' in this.params) {
      this.resultsPerPage(this.params['rpp']);
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
      this.addTypes(this.params['type']);
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
  }

  public addSort(fieldOrList: InputSortValue[]): Query;
  public addSort(fieldOrList: string, sortType?: string): Query;
  public addSort(fieldOrList: string | InputSortValue[], sortType: string = OrderType.ASC): Query {
    if (typeof fieldOrList === 'string') {
      this._sort.set(fieldOrList, this._validateOrderType(sortType));
    } else {
      for (const value of fieldOrList) {
        if (typeof value === 'string') {
          this._sort.set(value, OrderType.ASC);
        } else {
          const field = Object.keys(value)[0];
          const sortType: string = Object.values(value)[0] as string;
          this._sort.set(field, this._validateOrderType(sortType));
        }
      }
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
    if (typeof page === 'number' || typeof page === 'undefined') {
      this._page = page;
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
  public resultsPerPage(rpp?: number): Query {
    if (typeof rpp === 'number' || typeof rpp === 'undefined') {
      this._rpp = rpp;
    } else {
      throw new QueryValueError('Value error: Result per page must be a number');
    }
    return this;
  }

  /**
   * Sets the types to query in this query, call without
   * parameters to clear the setting
   *
   * @param  type - The type or types to set for this query
   *
   * @returns Query
   */
  public addTypes(types?: string | string[]): Query {
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
  public transformer(transformer?: string): Query {
    if (transformer) {
      this._transformer = this._validateTransformer(transformer);
    } else {
      this._transformer = undefined;
    }
    return this;
  }

  /**
   * Sets the timeout for the query, call it empty to reset
   *
   * @param  {Number}   timeout       The timeoout for the call
   *
   */
  public timeout(timeout?: number): void {
    if (timeout) {
      this.setParameter('timeout', timeout);
    } else {
      delete this.params.timeout;
    }
  }

  /**
   * Allows to ask for jsonp format, call without parameters
   * to clear the flag
   *
   * @param  {Boolean}    jsonp   Wether to use jsonp or not
   *
   */
  public jsonp(jsonp?: boolean): void {
    if (jsonp) {
      this.setParameter('jsonp', jsonp);
    } else {
      delete this.params.jsonp;
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
      if (queryName) {
        this._queryName = queryName;
      } else {
        delete this._queryName;
      }
    } else {
      throw new QueryValueError('Value error: queryname must be an string value');
    }
    return this;
  }

  /**
   * Sets the nostats flag, call without parameters to clear it
   *
   * @param - nostats   Wether to send the nostats flag or not
   *
   */
  public noStats(noStats?: boolean | number): Query {
    if (['boolean', 'string', 'undefined'].includes(typeof noStats)) {
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
   * Checks if a parameter is set
   *
   */
  public hasParameter(param: string): boolean {
    return param in this.params;
  }

  // Here starts the reading of the query

  /**
   * Gets an structure body parameters ready to be sent through a post
   * to the Doofinder Search API
   *
   * @return  {Object}
   *
   */
  public getParams(): DoofinderParameters {
    // Create a copy of the current params
    const params: SearchParameters = JSON.parse(JSON.stringify(this.params));
    delete params.query;
    return params;
  }

  public dump(): GenericObject {
    const dumpData: GenericObject = JSON.parse(JSON.stringify(this.params));

    if (this.hashid) {
      dumpData.hashid = this.hashid;
    }
    dumpData.query = this.text ? this.text : '';
    if (!isEmptyObject(this.filters)) {
      dumpData.filter = this.filters;
    }
    if (!isEmptyObject(this.excludedFilters)) {
      dumpData.excludedFilters = this.excludedFilters;
    }
    if (!isEmptyObject(this.sort)) {
      dumpData.sort = this.sort;
    }
    if (this._rpp) {
      dumpData.rpp = this._rpp;
    }
    if (this._page) {
      dumpData.page = this._page;
    }
    if (this._transformer) {
      dumpData.transformer = this._transformer;
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

    return dumpData;
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

  private _validateOrderType(sortType: string): OrderType {
    if (sortType.toLowerCase() === OrderType.ASC) {
      return OrderType.ASC;
    } else if (sortType.toLowerCase() === OrderType.DESC) {
      return OrderType.DESC;
    } else {
      throw new QueryValueError('Value error: Sort type must be: "asc" or "desc"');
    }
  }

  private _validateTransformer(transformer: string): TransformerOptions {
    if (transformer.toLowerCase() === TransformerOptions.Basic) {
      return TransformerOptions.Basic;
    } else if (transformer.toLowerCase() === TransformerOptions.OnlyID) {
      return TransformerOptions.OnlyID;
    } else {
      throw new QueryValueError('Value error: Transformer must be: "basic" or "onlyid"');
    }
  }
}
