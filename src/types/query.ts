import { DoofinderParameters } from './request';
import { RangeFacet } from '../../types';

export type TermsFacet = Set<string | number>;
export type Filter = Map<string, TermsFacet | RangeFacet>;

/**
 * Extension of the DoofinderParameters interface to accept
 * hashids and queries in it.
 *
 */
export interface SearchParameters extends DoofinderParameters {
  hashid?: string;
  query?: string | null;
}
