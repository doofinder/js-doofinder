import { DoofinderParameters } from '../types';
export interface SearchParameters extends DoofinderParameters {
    hashid?: string;
    query?: string;
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
