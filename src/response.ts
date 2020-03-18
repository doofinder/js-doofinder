import { GenericObject } from './types';

import { clone } from './util/clone';

/**
 * Represents a filter by numeric range.
 * @public
 */
export interface RangeFilter {
  /** Optional. Results will have a value smaller or equal than the provided value. */
  lte?: number;
  /** Optional. Results will have a value greater or equal than the provided value. */
  gte?: number;
  /** Optional. Results will have a value smaller than the provided value. */
  lt?: number;
  /** Optional. Results will have a value greater than the provided value. */
  gt?: number;
}

/**
 * Represents a filter by geographical distance.
 *
 * @example
 *
 * If the name of the field is `position`:
 *
 * ```ts
 * {
 *   geo_distance: {
 *     distance: '200km',
 *     position: '40,-70'
 *   }
 * }
 * ```
 *
 * @public
 */
export interface GeoDistanceFilter {
  /** To set the origin use the name of the geographical field as key and the lattitude,longitude as value. */
  [field: string]: string;
  /** The distance to the origin of the filter. */
  distance: string;
}

/**
 * Represents the information returned in the search response for a range filter.
 * @public
 */
export interface RangeStats {
  /** Average value for the field for all the matching results. */
  avg: number;
  /** Number of matching results. */
  count: number;
  /** Max value for the field for all the matching results. */
  max: number;
  /** Min value for the field for all the matching results. */
  min: number;
  /** Sum of the values for the field for all the matching results. */
  sum: number;
}

/**
 * Represents a single search result when the `basic` transformer is
 * used.
 *
 * @public
 */
export interface BasicResult {
  /** Id of the result. */
  id: string | number;
  /** Title of the result. */
  title: string;
  /** Description of the result. */
  description?: string;
  /** Link to the result. */
  link: string;
  /** Image of the result. */
  image_link?: string;
  /** Price of the result. Optional. */
  price?: number;
  /** Sale price of the result. Optional. */
  sale_price?: number;

  /**
   * Information provided from the data source to add the result
   * to the shopping cart.
   *
   * @deprecated Providing this kind of info in the data is a bad
   * practice because it can't be reutilized.
   */
  add_to_cart?: string;
  /** Users score for the result. */
  df_rating?: number;

  /** Id of the result in Doofinder. */
  dfid: string;
  /** Type of the result in Doofinder. */
  type: string;
}

/**
 * Represents a single search result when the `onlyid` transformer is
 * used.
 *
 * @public
 */
export type OnlyIdResult = Pick<BasicResult, 'id'>;

/**
 * Represents the basic search response from Doofinder.
 *
 * @public
 */
export interface SearchResponse extends GenericObject {
  /** The search terms provided. */
  query: string;
  /** The name of the internal query chosen by Doofinder to provide the results. */
  query_name: string;
  /** The counter sent in the request to control the flow of responses. */
  query_counter: number;

  /** The number of search results that can be retrieved. May be lower than the total number of results. */
  total: number;
  /** The number of results found for the current search. */
  total_found: number;
  /** The maximum score of the results for the current search. */
  max_score: number;

  /** The page number for the current set of results. */
  page: number;
  /** The number of results sent for each page. */
  results_per_page: number;

  /** Array of results. */
  results: GenericObject[];

  /** Autocomplete suggestion. Optional. */
  autocomplete_suggest?: string;
  /** Banner information for these search results, if any. Optional. */
  banner?: {
    /** Id of the banner. */
    id: number;
    /** Desktop image of the banner. */
    image: string;
    /** Mobile image of the banner. */
    mobile_image: string;
    /** Custom HTML code of the banner. */
    html_code: string;
    /** Target link of the banner. */
    link: string;
    /** Whether to open the banner in a new window or not. */
    blank: boolean;
  };

  /** Facets information for this set of results. */
  facets?: GenericObject<Facet>;
  /** RAW facets information received from the search server with no further processing. */
  _rawFacets?: GenericObject<RawFacet>;

  /** Filters applied to the search. */
  filter?: {
    /** Range filters applied to the search. */
    range: {
      [key: string]: RangeFilter;
    };
    /** Terms filters applied to the search. */
    terms: {
      [key: string]: string[];
    };
    /** Geo distance filters applied to the search. */
    geo_distance: GeoDistanceFilter;
    /** Other unknown types of filters. */
    [key: string]: GenericObject;
  };
}

/**
 * RAW information received for a range filter.
 *
 * @public
 */
export interface RawRangeFacet {
  /** Number of matching documents. */
  doc_count: number;
  /** Range information. */
  range: {
    buckets: {
      doc_count: number;
      from: number;
      key: string;
      /** Stats for the facet. */
      stats: RangeStats;
    }[];
  };
}

/**
 * RAW information for a term belonging to a terms facet.
 *
 * @public
 */
export interface RawTermStats {
  /** Number of matching documents. */
  doc_count: number;
  /** Value of the term. */
  key: string;
}

/**
 * RAW information for a set of terms belonging to a terms facet.
 *
 * @public
 */
export interface RawTermsInfo {
  /** The list of terms stats. */
  buckets: RawTermStats[];
  /** An upper bound of the error on the document counts for each term. */
  doc_count_error_upper_bound: number;
  /** sum of the document counts that are not part of the response. */
  sum_other_doc_count: number;
}

/**
 * RAW information received as a facet for a terms filter.
 *
 * @public
 */
export interface RawTermsFacet {
  /** Number of matching documents. */
  doc_count: number;
  /** Information about the selected terms. */
  selected: RawTermsInfo;
  /** The terms returned for the filter. */
  terms: RawTermsInfo;
  /** Number of matching documents. */
  total: {
    value: number;
  };
}

/**
 * Simplified version of a range facet info.
 *
 * @public
 */
export interface RangeFacet {
  /** Indicates this facet is of type range. */
  type: 'range';
  /** Stats for this facet. */
  range: RangeStats;
}

/**
 * Simplified stats for a term in a terms facet.
 *
 * @public
 */
export interface TermStats {
  /** Number of matching documents. */
  total: number;
  /** The value of the term. */
  value: string;
  /** If the term was selected or not when filtering. */
  selected?: boolean;
}

/**
 * Simplified version of the terms facet info.
 *
 * @public
 */
export interface TermsFacet {
  type: 'terms';
  terms: TermStats[];
}

/**
 * Union type of both the RAW range and terms facets.
 *
 * @public
 */
export type RawFacet = RawRangeFacet | RawTermsFacet | unknown;

/**
 * Union type of both the simplified range and terms facets.
 *
 * @public
 */
export type Facet = RangeFacet | TermsFacet | unknown;

/**
 * Represents the search response with no processing.
 *
 * @public
 */
export interface RawSearchResponse extends Omit<SearchResponse, 'facets' | '_rawFacets'> {
  facets: GenericObject<RawFacet>;
}

/**
 * Transform stats info for a term.
 *
 * @param term - A term stats info from the RAW response.
 * @returns A simplified version for the processed search response.
 *
 * @internal
 */
function transformTerm(term: RawTermStats): TermStats {
  return {
    total: term.doc_count,
    value: term.key,
  };
}

/**
 * Transform information for a terms facet.
 *
 * @param facet - A terms facet information from the RAW response.
 * @returns A simplified version for the processed search response.
 *
 * @internal
 */
function processTermsFacet(facet: RawTermsFacet): TermsFacet {
  const transformed: TermStats[] = facet.terms.buckets.map(transformTerm);
  const extra: TermStats[] = [];

  facet.selected.buckets.forEach((selected: RawTermStats) => {
    const found: TermStats = transformed.find((term: TermStats) => term.value === selected.key);
    if (found) {
      found.selected = true;
    } else {
      extra.push({ selected: true, ...transformTerm(selected) });
    }
  });

  const terms: TermStats[] = transformed.concat(extra);
  terms.sort((a: TermStats, b: TermStats) => {
    if (a.total < b.total) {
      return 1;
    } else if (a.total > b.total) {
      return -1;
    } else {
      return a.value.localeCompare(b.value);
    }
  });

  return {
    type: 'terms',
    terms,
  };
}

/**
 * Transform information for a range facet.
 *
 * @param facet - A range facet information from the RAW response.
 * @returns A simplified version for the processed search response.
 *
 * @internal
 */
function processRangeFacet(facet: RawRangeFacet): RangeFacet {
  return {
    type: 'range',
    range: facet.range.buckets[0].stats,
  };
}

/**
 * Generate a simpler version of a facets object from the response.
 *
 * @param rawFacets - An object with all the facets information as sent
 *                    by the Doofinder servers.
 * @returns An object with the simplified version of the provided facets.
 *
 * @internal
 */
function processFacets(rawFacets: GenericObject<RawFacet>): GenericObject<Facet> {
  const facets: GenericObject<Facet> = {};
  for (const field in rawFacets) {
    if ('terms' in (rawFacets[field] as RawTermsFacet)) {
      facets[field] = processTermsFacet(rawFacets[field] as RawTermsFacet);
    } else if ('range' in (rawFacets[field] as RawRangeFacet)) {
      facets[field] = processRangeFacet(rawFacets[field] as RawRangeFacet);
    } else {
      // TODO: Geodistance…
      facets[field] = rawFacets[field] as unknown;
    }
  }
  return facets;
}

/**
 * Process a search response to make it easier to manage.
 *
 * @param response - A RAW search response.
 * @returns The processed response.
 *
 * @internal
 */
export function processResponse(response: RawSearchResponse): SearchResponse {
  const result: SearchResponse = (response as unknown) as SearchResponse;
  if (response.facets != null) {
    result._rawFacets = clone(response.facets);
    result.facets = processFacets(response.facets);
  }
  return result;
}
