/* eslint-disable prettier/prettier */
import type { GenericObject, RangeFilter, GeoDistanceFilter } from './types';
/* eslint-enable prettier/prettier */

import { clone } from './util/clone';

export interface RangeStats {
  avg: number;
  count: number;
  max: number;
  min: number;
  sum: number;
}

// use this to cast results in case you use the basic transformer
export interface BasicResult {
  id: string | number;
  title: string;
  description?: string;
  link: string;
  image_link?: string;
  price?: number;
  sale_price?: number;

  add_to_cart?: string;
  df_rating?: number;

  dfid: string;
  type: string;
}

// use this to cast results in case you use the onlyid transformer
export type OnlyIdResult = Pick<BasicResult, 'id'>;

export interface BaseSearchResponse extends GenericObject {
  query: string;
  query_name: string;
  query_counter: number;

  total: number;
  total_found: number;
  max_score: number;

  page: number;
  results_per_page: number;

  results: GenericObject[];

  autocomplete_suggest?: string;
  banner?: {
    id: number;
    image: string;
    mobile_image: string;
    html_code: string;
    link: string;
    blank: boolean;
  };

  filter?: {
    range: {
      [key: string]: RangeFilter;
    };
    terms: {
      [key: string]: string[];
    };
    geo_distance: {
      [key: string]: GeoDistanceFilter;
    }
    [key: string]: GenericObject;
  };
}

export interface RawRangeFacet {
  doc_count: number;
  range: {
    buckets: {
      doc_count: number;
      from: number;
      key: string;
      stats: RangeStats;
    }[];
  };
}

export interface RawTermStats {
  doc_count: number;
  key: string;
}

export interface RawTermsInfo {
  buckets: RawTermStats[];
  doc_count_error_upper_bound: number;
  sum_other_doc_count: number;
}

export interface RawTermsFacet {
  doc_count: number;
  selected: RawTermsInfo;
  terms: RawTermsInfo;
  total: {
    value: number;
  };
}

export type RawFacet = RawRangeFacet | RawTermsFacet;

export interface RangeFacet {
  type: 'range';
  range: RangeStats;
}

export interface TermStats {
  total: number;
  value: string;
  selected?: boolean;
}

export interface TermsFacet {
  type: 'terms';
  terms: TermStats[];
}

export type Facet = RangeFacet | TermsFacet;

export interface RawSearchResponse extends BaseSearchResponse {
  facets: GenericObject<RawFacet>;
}

export interface SearchResponse extends BaseSearchResponse {
  facets: GenericObject<Facet>;
  _rawFacets: GenericObject<RawFacet>;
}

function transformTerm(term: RawTermStats): TermStats {
  return {
    total: term.doc_count,
    value: term.key,
  };
}

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

function processRangeFacet(facet: RawRangeFacet): RangeFacet {
  return {
    type: 'range',
    range: facet.range.buckets[0].stats,
  };
}

function processFacets(rawFacets: GenericObject<RawFacet>): GenericObject<Facet> {
  if (rawFacets) {
    const facets: GenericObject<Facet> = {};
    for (const field in rawFacets) {
      if ('terms' in rawFacets[field]) {
        facets[field] = processTermsFacet(rawFacets[field] as RawTermsFacet);
      } else if ('range' in rawFacets[field]) {
        facets[field] = processRangeFacet(rawFacets[field] as RawRangeFacet);
      }
    }
    return facets;
  }
}

export function processResponse(response: RawSearchResponse): SearchResponse {
  const result: SearchResponse = (response as unknown) as SearchResponse;
  result._rawFacets = clone(response.facets);
  result.facets = processFacets(response.facets);
  return result;
}
