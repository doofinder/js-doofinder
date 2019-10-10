import { DoofinderParameters } from '../types';
export interface SearchParameters extends DoofinderParameters {
    hashid?: string;
    query?: string | null;
}
