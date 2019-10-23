import { QueryTypes, TransformerOptions, DoofinderParameters, Facet, FacetOption, SearchParameters } from './types';
import { isPlainObject, isArray } from './util/is';

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

  public constructor(hashid?: string | SearchParameters | Query) {
    if (typeof hashid === 'string') {
      this.hashid = hashid;
      this.params.hashid = this.hashid;
    } else if (hashid instanceof Query) {
      // Let's create a quick copy with this
      const params: SearchParameters = hashid.getParams();
      params.query = hashid.getQuery();
      this.params = params;
    } else if (typeof hashid === 'object') {
      // It's a complete object to pass on
      if ('params' in hashid) {
        this.params = hashid['params'] as SearchParameters;
      } else {
        this.params = hashid;
      }
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

  /**
   * Allows to directly set a parameter on the query builder
   *
   */
  public setParameter(paramName: string, value: unknown): void {
    if (paramName !== 'params') {
      this.params[paramName] = value;
    } else {
      throw new Error('Wrong parameter name!');
    }
  }

  /**
   * Overwrites the parameters with the object given, allowing
   * to change in one call several parameters
   *
   */
  public setParameters(parameters: SearchParameters): void {
    this.params = Object.assign({}, this.params, parameters);
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
    let filters: Facet = {};

    if (filterType in this.params) {
      filters = this.params[filterType] as Facet;
    }

    if (!filters[filterName]) {
      filters[filterName] = [];
    }

    if (!isPlainObject(value)) {
      (filters[filterName] as Array<unknown>).push(value);
    } else {
      filters[filterName] = value;
    }

    this.params[filterType] = filters;
    this.params.page = 1;
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
    const filters: Facet = this.params[filterType] as Facet;

    if (filters[filterName]) {
      const index: number = (filters[filterName] as Array<unknown>).indexOf(value);

      if (index !== -1) {
        (filters[filterName] as Array<unknown>).splice(index, 1);
        this.params[filterType] = filters;
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
    const filters: Facet = (this.params[filterType] as Facet) || {};
    return filterName in filters && (!value || (filters[filterName] as Array<unknown>).indexOf(value) !== -1);
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
  public toggleFilter(filterName: string, value: unknown, filterType = 'filter'): void {
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
    this.params[filterType] = filters;
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
   * @param  {Object}        filters            The exclusion filter to add
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
    const typeParam: string[] = [];

    if (typeof this.params.type === 'string') {
      typeParam.push(this.params.type);
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

  /**
   * Gets the current query
   *
   * @return   {String}
   *
   */
  public getQuery(): string {
    return this.params.query;
  }
}