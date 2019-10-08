import { Facet, FacetOption } from './types';
/**
 * Main QueryBuilder interface, allows creating programmaticly
 * the query using methods instead of creating the JSON and
 * parameters by hand, and doing the searches in a deferred
 * mode
 *
 */
export declare class Query {
    private params;
    private hashid;
    constructor(hashid?: string);
    /**
     * Sets the query string to make a search
     *
     * NOTE: This does not search, just sets the parameter
     *
     */
    search(query: string): void;
    /**
     * Puts the query in an empty state
     *
     */
    clear(): void;
    setParameter(paramName: string, value: any): void;
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
    addFilter(filterName: string, value: FacetOption, filterType?: string): void;
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
    removeFilter(filterName: string, value: FacetOption, filterType?: string): void;
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
    hasFilter(filterName: string, value?: FacetOption, filterType?: string): boolean;
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
    toggleFilter(filterName: string, value: any, filterType?: string): void;
    /**
     * Sets the filter structure directly to the requests of a given context
     *
     * @param  {Object}     filters            The filter structure
     *
     * @param  {String}     filterType         If we are adding a "filter" (default)
     *                                         or an "exclude" filter.
     *
     */
    setFilters(filters: Facet, filterType?: string): void;
    /**
     * Adds an exclusion to the current context
     *
     * @param  {String}     filterName         The exclusion filter to add
     *
     * @param  {Any}        value              The value to set the exclusion to
     *
     */
    addExclusion(filterName: string, value: FacetOption): void;
    /**
     * Removes an exclusion to the current context
     *
     * @param  {String}     filterName         The exclusion filter to add
     *
     * @param  {Any}        value              The value to set the exclusion to
     *
     */
    removeExclusion(filterName: string, value: FacetOption): void;
    /**
     * Sets an exclusion structure to the current context
     *
     * @param  {Any}        filters            The exclusion filter to add
     *
     */
    setExclusions(filters: Facet): void;
    /**
     * Sets the page value of the request, useful for pagination
     *
     * @param  {Number}     page              The page we want to set
     *
     */
    setPage(page: number): void;
    /**
     * Advances the current page to the next one
     *
     */
    nextPage(): void;
    /**
     * Gets an structure body parameters ready to be sent through a post
     * to the Doofinder Search API
     *
     */
    getParams(): object;
    /**
     * Gets the current query
     */
    getQuery(): string;
}
