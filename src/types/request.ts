interface RangeFilter {
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

/**
 * Doofinder Filter definition
 *
 */
export interface RequestFiltersObject {
  [field: string]: string | number | string[] | number[] | RangeFilter;
}
