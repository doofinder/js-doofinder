import { Facet, FacetOption, GenericObject, QueryTypes } from './types';

export interface SingleResult {
  id?: string | number;
  description?: string;
  dfid: string;
  title?: string;
  url?: string;
  image_url?: string;
  type: string;
  [propName: string]: any; // Extra fields go here
}

enum FilterType {
  Terms = 'terms',
  Range = 'range',
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
export class DoofinderResult {
  private _results: SingleResult[] = [];
  private _page = 1;
  private _total: number = null;
  private _total_found: number = null;
  private _max_score: number = null;
  private _query: string = null;
  private _query_counter: number = null;
  private _query_name: QueryTypes = null;
  private _results_per_page: number = null;
  private _facets: Facet[] = null;
  private _filters: FilterResponse = null;
  private _raw: GenericObject = null;

  public constructor(results?: GenericObject) {
    if (results) {
      this.loadResults(results);
    }
  }

  private loadFacets(facetObj: GenericObject): void {
    this._facets = Object.keys(facetObj).map(
      (key: string): Facet => {
        if ('terms' in facetObj[key]) {
          const terms: Array<FacetOption> = [];
          facetObj[key].terms.buckets.forEach((bucket: FacetOption): void => {
            terms.push(bucket);
          });
          const result: Facet = {};
          result[key] = terms as FacetOption;
          return result;
        } else if ('range' in facetObj[key]) {
          const result: Facet = {};
          result[key] = facetObj[key].range.buckets[0].stats as FacetOption;
          return result;
        }
      }
    );
  }

  // Public interface

  public get results(): SingleResult[] {
    return this._results;
  }
  public get page(): number {
    return this._page;
  }
  public get total(): number {
    return this._total;
  }
  public get total_found(): number {
    return this._total_found;
  }
  public get max_score(): number {
    return this._max_score;
  }
  public get query(): string {
    return this._query;
  }
  public get query_counter(): number {
    return this._query_counter;
  }
  public get query_name(): QueryTypes {
    return this._query_name;
  }
  public get results_per_page(): number {
    return this._results_per_page;
  }
  public get facets(): Facet[] {
    return this._facets;
  }
  public get filters(): FilterResponse {
    return this._filters;
  }
  public get raw(): GenericObject {
    return this._raw;
  }

  /**
   * Allows to feed a raw result object from the
   * endpoint, erasing the instance's content and
   * filling it with the new content
   *
   * @param  {Object}   results   The results object to load
   *
   */
  public loadResults(results: GenericObject): void {
    this._raw = results;
    if (results.total_found > 0) {
      this._results = results.results;
    } else {
      this._results = [];
    }
    this._page = results.page;
    this._total = results.total;
    this._total_found = results.total_found;
    this._max_score = results.max_score;
    this._query = results.query;
    this._query_name = results.query_name;
    this._query_counter = results.query_counter;
    this._results_per_page = results.results_per_page;
    if (results.facets) {
      this.loadFacets(results.facets);
    }
    if (results.filters) {
      this._filters = results.filters;
    }
  }

  /**
   * Allow to return a fresh unlinked copy of this instance
   * into a new one, making it a real copy, not a reference
   *
   */
  public copy(): DoofinderResult {
    return new DoofinderResult(this._raw);
  }
}
