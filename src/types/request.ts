import { QueryTypes, Sort, TransformerOptions } from './base';

export interface RangeFilter {
  from: number;
  to: number;
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
