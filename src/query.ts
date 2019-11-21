import {
  QueryTypes,
  TransformerOptions,
  DoofinderParameters,
  FacetOption,
  SearchParameters,
  GenericObject,
} from './types';
import { isPlainObject, isArray, isEmptyObject } from './util/is';

/**
 * Values available for the sorting options
 * TODO: If this is not used in the response, move to request.ts
 */
export enum SortType {
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

export type SortValue = Map<string, SortType>;

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
  private _excludedFilters: Filter = new Map();
  private _sort: SortValue = new Map();

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
    return this._getFilter(this._excludedFilters);
  }

  public get sort(): GenericObject {
    const result: InputExtendedSortValue[] = [];
    this._sort.forEach((value, key) => {
      const sortValue: GenericObject = {};
      sortValue[key] = value;
      result.push(sortValue);
    });
    return result;
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
    this._excludedFilters = new Map();
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
    return this._addFilter(this._excludedFilters, filterName, value);
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
  public removeExcludedFilter(filterName: string, value: InputFilterValue): Query {
    this._removeFilter(this._excludedFilters, filterName, value);
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

  public hasExcludedFilter(filterName: string, value?: string): boolean {
    return this._hasFilter(this._excludedFilters, filterName, value);
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

  public toggleExcludedFilter(filterName: string, value: FacetOption | string | number): void {
    let values: Array<RangeFilter | string | number> = [];

    if (Array.isArray(value)) {
      values = value;
    } else if (typeof value === 'string' || typeof value === 'number' || isPlainObject(value)) {
      values = [value];
    }

    (values as Array<unknown>).forEach((value: any) => {
      if (this.hasExcludedFilter(filterName, value)) {
        this.removeExcludedFilter(filterName, [value]);
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
    }
  }

  public addSort(fieldOrList: InputSortValue[]): Query;
  public addSort(fieldOrList: string, sortType?: string): Query;
  public addSort(fieldOrList: string | InputSortValue[], sortType: string = SortType.ASC): Query {
    if (typeof fieldOrList === 'string') {
      this._sort.set(fieldOrList, this._validateSortType(sortType));
    } else {
      for (const value of fieldOrList) {
        if (typeof value === 'string') {
          this._sort.set(value, SortType.ASC);
        } else {
          const field = Object.keys(value)[0];
          const sortType: string = Object.values(value)[0] as string;
          this._sort.set(field, this._validateSortType(sortType));
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
   * @param  {Number}     page              The page we want to set
   *
   */
  public page(page?: number): void {
    if (page) {
      this.setParameter('page', page);
    } else {
      delete this.params.page;
    }
  }

  /**
   * Advances the current page to the next one
   *
   */
  public nextPage(): void {
    this.setParameter('page', (this.params.page || 1) + 1);
  }

  /**
   * Sets the Results Per Page (rpp) parameter.
   *
   * @param  {Number}   rpp   The results per page to set
   *
   */
  public resultsPerPage(rpp?: number): void {
    if (rpp) {
      this.setParameter('rpp', rpp);
    } else {
      delete this.params.rpp;
    }
  }

  /**
   * Sets the types to query in this query, call without
   * parameters to clear the setting
   *
   * @param  {String | String[]}  type    The type or types to set
   *                                      for this query
   *
   */
  public setTypes(type?: string | string[]): void {
    if (type) {
      this.setParameter('type', type);
    } else {
      delete this.params.type;
    }
  }

  /**
   * Adds a type to the current types in this query
   *
   * @param  {String}   type    The type to be added for the search
   *
   */
  public addType(type: string): void {
    let typeParam: string[] = [];

    if (typeof this.params.type === 'string') {
      typeParam.push(this.params.type);
    } else if (this.params.type) {
      typeParam = this.params.type;
    }

    typeParam.push(type);
    this.setParameter('type', typeParam);
  }

  /**
   * Remove a type from this query
   *
   * @param  {String}   type    The type to be removed for the search
   *
   */
  public removeType(type: string): void {
    if (this.params.type) {
      if (isArray(this.params.type)) {
        const index: number = this.params.type.indexOf(type);
        if (index !== -1) {
          (this.params.type as Array<unknown>).splice(1, index);
        }
      } else if (this.params.type === type) {
        delete this.params.type;
      }
    }
  }

  /**
   * Sets the transformer, call it empty to reset it to null
   *
   * @param  {String}   transformer   The transformer option to set
   */
  public transformer(transformer?: TransformerOptions): void {
    if (transformer) {
      this.setParameter('transformer', transformer);
    } else {
      delete this.params.transformer;
    }
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
  public queryName(queryName?: QueryTypes): void {
    if (queryName) {
      this.setParameter('query_name', queryName);
    } else {
      delete this.params.query_name;
    }
  }

  /**
   * Sets the nostats flag, call without parameters to clear it
   *
   * @param  {Boolean}    nostats   Wether to send the nostats flag or not
   *
   */
  public noStats(nostats?: boolean): void {
    if (nostats && !!nostats) {
      this.setParameter('nostats', 1);
    } else {
      delete this.params.nostats;
    }
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
      // TODO: Define this error better.
      throw new Error('Error in filter value');
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

  private _validateSortType(sortType: string): SortType {
    if (sortType.toLowerCase() === SortType.ASC) {
      return SortType.ASC;
    } else if (sortType.toLowerCase() === SortType.DESC) {
      return SortType.DESC;
    } else {
      throw new Error('Invalid value for sort type, it must be: "asc" or "desc"');
    }
  }
}
