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
 * Doofinder types
 *
 */
export { SearchParameters } from './querybuilder/types';
/**
 * The zones the client can be from
 *
 */
export declare enum Zone {
    EU = "eu1",
    US = "us1"
}
/**
 * The type definition of the options that
 * can be sent to the Doofinder Client
 *
 */
export interface DoofinderClientOptions {
    zone?: string;
    apiKey?: string;
    address?: string;
    version?: string;
    headers?: object;
}
/**
 * A filter range must have these two
 * values
 *
 */
export interface DoofinderFilterRange {
    from: number;
    to: number;
}
/**
 * Doofinder Filter definition
 *
 */
export interface DoofinderFilter {
    field: string[] | DoofinderFilterRange;
}
/**
 * Values available for the sorting options
 *
 */
export declare enum DoofinderSorting {
    ASC = "asc",
    DESC = "desc"
}
/**
 * A single sorting option definition
 *
 */
export interface DoofinderSortOption {
    [field: string]: DoofinderSorting;
}
/**
 * The available transformer options
 *
 */
export declare enum TransformerOptions {
    Basic = "basic",
    OnlyID = "onlyid"
}
/**
 * These are the used query types
 * in the Doofinder system
 *
 */
export declare enum QueryTypes {
    MatchAnd = "match_and",
    MatchOr = "match_or",
    Fuzzy = "fuzzy",
    PhoneticText = "phonetic_text"
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
    filter?: DoofinderFilter;
    exclude?: DoofinderFilter;
    transformer?: TransformerOptions;
    sort?: string | DoofinderSortOption | DoofinderSortOption[];
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
export declare type FacetOption = RangeFacet | string[] | number[];
/**
 * Type holding all the current facets
 *
 */
export interface Facet {
    [facetName: string]: FacetOption;
}
