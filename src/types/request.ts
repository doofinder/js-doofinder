export interface RangeFilterInputValue {
  lte?: number;
  gte?: number;
  lt?: number;
  gt?: number;
}

export interface GeoDistanceFilterInputValue {
  [field: string]: string;
  distance: string;
}

export type TermsFilterInputValue = string | number | string[] | number[];
export type FilterInputValue = TermsFilterInputValue | RangeFilterInputValue | GeoDistanceFilterInputValue;

export type SortOrder = 'asc' | 'desc';

export interface GeoSortOrder {
  [field: string]: string;
  order: SortOrder;
}

// is this _geo_distance instead???
export interface GeoSorting {
  geo_distance: GeoSortOrder;
}

export interface FieldSorting {
  [field: string]: SortOrder;
}

export type Sorting = FieldSorting | GeoSorting;

export type SortingInput = string | Sorting;
