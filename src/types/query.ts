import { DoofinderParameters } from './request';

/**
 * Extension of the DoofinderParameters interface to accept
 * hashids and queries in it.
 *
 */
export interface SearchParameters extends DoofinderParameters {
  hashid?: string;
  query?: string | null;
}