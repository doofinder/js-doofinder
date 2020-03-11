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
