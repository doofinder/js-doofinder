import { GenericObject } from './base';

export interface RangeFilter {
  lte?: number;
  gte?: number;
  lt?: number;
  gt?: number;
}

export interface GeoDistanceFilter {
  [field: string]: string;
  distance: string;
}

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
