/**
 * This interface allow to use object[key: string] without
 * TypeScript giving problems about it.
 *
 * Beware, as this invalidates some of the type checkings
 * we want from TypeScript, and maybe that is not what you
 * want
 */
export interface GenericObject<T = any> {
  [key: string]: T;
}

/**
 * The zones the client can be from
 *
 */
export enum Zone {
  EU = 'eu1',
  US = 'us1',
}

/**
 * The type definition of the options that
 * can be sent to the Doofinder Client
 *
 */
export interface ClientOptions {
  apiKey: string;
  zone: Zone;
  hashid: string;
  serverAddress: string;
  headers: GenericObject<string>;
}

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
 * Values available for the sorting options
 *
 */
export enum Sort {
  ASC = 'asc',
  DESC = 'desc',
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
 * The available transformer options
 *
 */
export enum TransformerOptions {
  Basic = 'basic',
  OnlyID = 'onlyid',
}

/**
 * These are the used query types
 * in the Doofinder system
 *
 */
export enum QueryTypes {
  MatchAnd = 'match_and',
  MatchOr = 'match_or',
  Fuzzy = 'fuzzy',
  PhoneticText = 'phonetic_text',
}

/**
 * This type is the available fields and
 * parameters available for the search
 * endpoint at Doofinder
 *
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

/**
 * Type definition for the Doofinder Headers
 *
 */
export interface DoofinderHeaders {
  [headerKey: string]: string;
}

/**
 * This interface holds the available options
 * for any common request done to the Doofinder
 * endpoints in the Search API
 *
 */
export interface DoofinderRequestOptions {
  host: string;
  port?: string | number;
  protocol?: string;
  headers?: DoofinderHeaders;
}

/**
 * Defines the fields for a facet
 * that is a range. Beware, we need
 * either one of the lt or lte fields
 * and either one of the gt or gte fields
 *
 */
export interface RangeFacet {
  lte?: number;
  gte?: number;
  lt?: number;
  gt?: number;
}

/**
 * Type definition of a single facet
 *
 */
export type FacetOption = RangeFacet | string[] | number[];

/**
 * Type holding all the current facets
 *
 */
export interface Facet {
  [facetName: string]: FacetOption;
}
