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
export declare enum Zone {
    EU = "eu1",
    US = "us1"
}
export interface DoofinderClientOptions {
    zone?: string;
    apiKey?: string;
    address?: string;
    version?: string;
    headers?: object;
}
export interface DoofinderFilterRange {
    from: number;
    to: number;
}
export interface DoofinderFilter {
    field: string[] | DoofinderFilterRange;
}
export declare enum DoofinderSorting {
    ASC = "asc",
    DESC = "desc"
}
export interface DoofinderSortOption {
    [field: string]: DoofinderSorting;
}
export declare enum TransformerOptions {
    Basic = "basic",
    OnlyID = "onlyid"
}
export declare enum QueryTypes {
    MatchAnd = "match_and",
    MatchOr = "match_or",
    Fuzzy = "fuzzy",
    PhoneticText = "phonetic_text"
}
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
export interface DoofinderHeaders {
    [headerKey: string]: string;
}
export interface DoofinderRequestOptions {
    host: string;
    port?: string | number;
    protocol?: string;
    headers?: DoofinderHeaders;
}
export interface RangeFacet {
    lte?: number;
    gte?: number;
    lt?: number;
    gt?: number;
}
export declare type FacetOption = RangeFacet | string[] | number[];
export interface Facet {
    [facetName: string]: FacetOption;
}
