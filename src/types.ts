/**
 * This interface allow to use object[key: string] without
 * TypeScript giving problems about it.
 *
 * Beware, as this invalidates some of the type checkings
 * we want from TypeScript, and maybe that is not what you
 * want
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface GenericObject<T = any> {
  [key: string]: T;
}

export interface RangeFilter {
  lte?: number;
  gte?: number;
  lt?: number;
  gt?: number;
}

export interface GeoDistanceFilter {
  [field: string]: string;
  distance: string;
}
