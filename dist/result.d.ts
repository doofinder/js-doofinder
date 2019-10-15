import { Facet, GenericObject, QueryTypes } from './types';
export interface SingleResult {
    id?: string | number;
    description?: string;
    dfid: string;
    title?: string;
    url?: string;
    image_url?: string;
    type: string;
    [propName: string]: any;
}
interface FilterResponse {
    [filterType: string]: string[] | GenericObject;
}
/**
 * Wrapper object to retrieve the results given
 * by the search endpoint easily through a programmatic
 * interface and normalized results
 *
 */
export declare class DoofinderResult {
    private _results;
    private _page;
    private _total;
    private _total_found;
    private _max_score;
    private _query;
    private _query_counter;
    private _query_name;
    private _results_per_page;
    private _facets;
    private _filters;
    private _raw;
    constructor(results?: GenericObject);
    private loadFacets;
    readonly results: SingleResult[];
    readonly page: number;
    readonly total: number;
    readonly total_found: number;
    readonly max_score: number;
    readonly query: string;
    readonly query_counter: number;
    readonly query_name: QueryTypes;
    readonly results_per_page: number;
    readonly facets: Facet[];
    readonly filters: FilterResponse;
    readonly raw: GenericObject;
    /**
     * Allows to feed a raw result object from the
     * endpoint, erasing the instance's content and
     * filling it with the new content
     *
     * @param  {Object}   results   The results object to load
     *
     */
    loadResults(results: GenericObject): void;
    /**
     * Allow to return a fresh unlinked copy of this instance
     * into a new one, making it a real copy, not a reference
     *
     */
    copy(): DoofinderResult;
}
export {};
