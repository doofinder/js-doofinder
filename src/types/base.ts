/**
 * The zones the client can be from
 */
export enum Zone {
  EU = 'eu1',
  US = 'us1',
}

/**
 * Values available for the sorting options
 * TODO: If this is not used in the response, move to request.ts
 */
export enum Sort {
  ASC = 'asc',
  DESC = 'desc',
}

/**
 * The available transformer options
 */
export enum TransformerOptions {
  Basic = 'basic',
  OnlyID = 'onlyid',
}

/**
 * These are the used query types
 * in the Doofinder system
 */
export enum QueryTypes {
  MatchAnd = 'match_and',
  MatchOr = 'match_or',
  Fuzzy = 'fuzzy',
  PhoneticText = 'phonetic_text',
}

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
