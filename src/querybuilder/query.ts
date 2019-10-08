import { SearchParameters, Facet, FacetOption } from './types';
import { QueryTypes, TransformerOptions } from '../types';
import { isPlainObject, isArray } from '../util/is';

/**
 * Main QueryBuilder interface, allows creating programmaticly
 * the query using methods instead of creating the JSON and 
 * parameters by hand, and doing the searches in a deferred 
 * mode
 *
 */
export class Query {
  private params: SearchParameters = {};
  private hashid: string = null;

  constructor(hashid?: string) {
    if (hashid) {
      this.hashid = hashid;
      this.params.hashid = this.hashid;
    }
  }

  /**
   * Sets the query string to make a search
   *
   * NOTE: This does not search, just sets the parameter
   *
   */
  public search(query: string): void {
    this.params.query = query;
  }

  /**
   * Puts the query in an empty state
   *
   */
  public clear(): void {
    this.params = {};
  }

  public setParameter(paramName: string, value: any): void {
    // FIXME: Find a better way to ensure type checking here
    (this.params as any)[paramName] = value;
  }

  /**
   * This method adds a concrete filter to the current search request, and
   * resets the page counter
   *
   * @param  {String}     context            The context to affect
   *
   * @param  {String}     filterName         The name of the filter to set
   *
   * @param  {Any}        value              The value to set the filter to
   *                                         (several can be added to the same filter)
   *
   * @param  {String}     filterType         If we are adding a "filter" (default)
   *                                         or an "exclude" filter.
   *
   */
  public addFilter(filterName: string, value: FacetOption, filterType = 'filter'): void {
    let filters: Facet = (this.params as any)[filterType];
    
    if (!filters[filterName]) {
      filters[filterName] = [];
    }

    if (!isPlainObject(value)) {
      (filters[filterName] as Array<any>).push(value);
    } else {
      filters[filterName] = value;
    }

    Object.assign(this.params, {filterType: filters});
  }

  /**
   * This method removes a given filter to the current search request, and
   * resets the page counter
   *
   * @param  {String}     context            The context to affect
   *
   * @param  {String}     filterName         The name of the filter to modify
   *
   * @param  {Any}        value              The value to remove from the filter
   *
   * @param  {String}     filterType         If we are adding a "filter"
   *                                         (default) or an "exclude" filter.
   *
   */
  public removeFilter(filterName: string, value: FacetOption, filterType = 'filter'): void {
    let filters: Facet = (this.params as any)[filterType];

    if (filters[filterName]) {
      let index: number = (filters[filterName] as any).indexOf(value);

      if (index !== -1) {
        (filters[filterName] as any).splice(index, 1);
        (this.params as any)[filterType] = filters;
        this.params.page = 1;
      }
    }
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
  public hasFilter(filterName: string, value?: FacetOption, filterType = 'filter'): boolean {
    const filters: Facet = (this.params as any)[filterType] || {};
    return filterName in filters && (!value || (filters[filterName] as any).indexOf(value) !== -1);
  }

  /**
   * Toggles a filter value from the given filter in the given context
   *
   * @param  {String}     context            The context to affect
   *
   * @param  {String}     filterName         The name of the filter to modify
   *
   * @param  {Any}        value              The value to remove from the filter
   *
   * @param  {String}     filterType         If we are adding a "filter"
   *                                         (default) or an "exclude" filter.
   *
   */
  public toggleFilter(filterName: string, value: any, filterType = 'filter'): void {
    if (!this.hasFilter(filterName, value, filterType)) {
      this.addFilter(filterName, value, filterType);
    } else {
      this.removeFilter(filterName, value, filterType);
    }
  }

  /**
   * Sets the filter structure directly to the requests of a given context
   *
   * @param  {Object}     filters            The filter structure
   *
   * @param  {String}     filterType         If we are adding a "filter" (default)
   *                                         or an "exclude" filter.
   *
   */
  public setFilters(filters: Facet, filterType = 'filter'): void {
    (this.params as any)[filterType] = filters;
    this.params.page = 1;
  }

  /**
   * Adds an exclusion to the current context
   *
   * @param  {String}     filterName         The exclusion filter to add
   *
   * @param  {Any}        value              The value to set the exclusion to
   *
   */
  public addExclusion(filterName: string, value: FacetOption): void {
    this.addFilter(filterName, value, 'exclude');
  }

  /**
   * Removes an exclusion to the current context
   *
   * @param  {String}     filterName         The exclusion filter to add
   *
   * @param  {Any}        value              The value to set the exclusion to
   *
   */
  public removeExclusion(filterName: string, value: FacetOption): void {
    this.removeFilter(filterName, value, 'exclude');
  }

  /**
   * Sets an exclusion structure to the current context
   *
   * @param  {Any}        filters            The exclusion filter to add
   *
   */
  public setExclusions(filters: Facet): void {
    this.setFilters(filters, 'exclude');
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
   */
  public setTypes(type?: string | string[]): void {
    if (type) {
      this.setParameter('type',  type);
    } else {
      delete this.params.type;
    }
  }

  /**
   * Adds a type to the current types in this query 
   *
   */
  public addType(type: string): void {
    let typeParam: string[] = [];

    if (typeof this.params.type === 'string') {
      typeParam.push(this.params.type);
    }

    typeParam.push(type);
    this.setParameter('type', typeParam);
  }

  /**
   * Remove a type from this query
   *
   */
  public removeType(type: string): void {
    if (this.params.type) {
      if (isArray(this.params.type)) {
        let index: number = this.params.type.indexOf(type);
        if (index !== -1) {
          (this.params.type as any).splice(1, index);
        }
      } else if (this.params.type === type) {
        delete this.params.type;
      }
    }
  }

  /**
   * Sets the transformer, call it empty to reset it to null
   *
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
   */
  public noStats(nostats?: boolean): void {
    if ((nostats) && (!!nostats)) {
      this.setParameter('nostats', 1);
    } else {
      delete this.params.nostats;
    }
  }

  // Here starts the reading of the query
  
  /**
   * Gets an structure body parameters ready to be sent through a post
   * to the Doofinder Search API 
   *
   */
  public getParams(): object {
    // Create a copy of the current params
    let params: object = JSON.parse(JSON.stringify(this.params));
    delete (params as any)['query'];
    return params;
  }

  /**
   * Gets the current query 
   */
  public getQuery(): string {
    return this.params.query;
  }
}
