import { QueryTypes, Sort, TransformerOptions } from './base';

export interface RangeFilter {
  from: number;
  to: number;
}

/**
 * Defines the fields for a facet
 * that is a range. Beware, we need
 * either one of the lt or lte fields
 * and either one of the gt or gte fields
 */
export interface RangeFacet {
  lte?: number;
  gte?: number;
  lt?: number;
  gt?: number;
}

/**
 * Type definition of a single facet
 */
export type FacetOption = RangeFacet | string[] | number[] | string | number;

/**
 * Type holding all the current facets
 */
export interface Facet {
  [facetName: string]: FacetOption;
}

export type TermsFilter = string | string[];

/**
 * Doofinder Filter definition
 *
 */
export interface RequestFiltersObject {
  [field: string]: TermsFilter | RangeFilter;
}

/**
 * A single sorting option definition
 *
 */
export interface SortDefinition {
  [field: string]: Sort;
}

export type RequestSortOptions = string | SortDefinition | SortDefinition[];

/**
 * This type is the available fields and
 * parameters available for the search
 * endpoint at Doofinder
 */
export interface DoofinderParameters {
  page?: number;
  rpp?: number;
  type?: string | string[];
  filter?: RequestFiltersObject;
  exclude?: RequestFiltersObject;
  transformer?: TransformerOptions;
  sort?: RequestSortOptions;
  timeout?: number;
  jsonp?: boolean;
  query_name?: QueryTypes;
  nostats?: number;
  [paramName: string]: unknown;
}
