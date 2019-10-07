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

export enum Zone {
  EU = 'eu1',
  US = 'us1',
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

export enum DoofinderSorting {
  ASC = 'asc',
  DESC = 'desc'
}

export interface DoofinderSortOption {
  [field: string]: DoofinderSorting
}

export interface DoofinderParameters {
   page?: number;
   rpp?: number;
   type?: string | string[];
   filter?: DoofinderFilter;
   exclude?: DoofinderFilter;
   sort?: String | DoofinderSortOption | DoofinderSortOption[];
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

