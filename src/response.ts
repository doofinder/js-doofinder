import { GenericObject } from './types/base';
import {
  RawTermStats,
  TermStats,
  RawTermsFacet,
  TermsFacet,
  RawRangeFacet,
  RangeFacet,
  RawFacet,
  RawSearchResponse,
  SearchResponse,
  Facet,
} from './types/response';

import { clone } from './util/clone';

function transformTerm(term: RawTermStats): TermStats {
  return {
    total: term.doc_count,
    value: term.key,
  };
}

function processTermsFacet(facet: RawTermsFacet): TermsFacet {
  const transformed: TermStats[] = facet.terms.buckets.map(transformTerm);
  const extra: TermStats[] = [];

  facet.selected.buckets.forEach((selected: RawTermStats) => {
    const found: TermStats = transformed.find((term: TermStats) => term.value === selected.key);
    if (found) {
      found.selected = true;
    } else {
      extra.push({ selected: true, ...transformTerm(selected) });
    }
  });

  const terms: TermStats[] = transformed.concat(extra);
  terms.sort((a: TermStats, b: TermStats) => {
    if (a.total < b.total) {
      return 1;
    } else if (a.total > b.total) {
      return -1;
    } else {
      return a.value.localeCompare(b.value);
    }
  });

  return {
    type: 'terms',
    terms,
  };
}

function processRangeFacet(facet: RawRangeFacet): RangeFacet {
  return {
    type: 'range',
    range: facet.range.buckets[0].stats,
  };
}

function processFacets(rawFacets: GenericObject<RawFacet>): GenericObject<Facet> {
  if (rawFacets) {
    const facets: GenericObject<Facet> = {};
    for (const field in rawFacets) {
      if ('terms' in rawFacets[field]) {
        facets[field] = processTermsFacet(rawFacets[field] as RawTermsFacet);
      } else if ('range' in rawFacets[field]) {
        facets[field] = processRangeFacet(rawFacets[field] as RawRangeFacet);
      }
    }
    return facets;
  }
}

export function processResponse(response: RawSearchResponse): SearchResponse {
  const result: SearchResponse = (response as unknown) as SearchResponse;
  result._rawFacets = clone(response.facets);
  result.facets = processFacets(response.facets);
  return result;
}
