// required for testing
import 'mocha';
import { should, expect } from 'chai';
import { basicResponse } from './fixtures/basic_response';

import { processResponse, SearchResponse } from '../src/response';

// chai
should();

describe('Search Response', () => {
  it('should properly transform facets', done => {
    const response: SearchResponse = processResponse(basicResponse);
    response._rawFacets.should.not.be.undefined;
    response.facets.best_price.should.eql({
      type: 'range',
      range: {
        avg: 283.44241397604185,
        count: 2295,
        max: 1490.0,
        min: 0.0,
        sum: 650500.340075016
      }
    });
    response.facets.brand.should.be.eql({
      type: 'terms',
      terms: [
        { total: 426, value: 'JANE', selected: true },
        { total: 275, value: 'BE COOL' },
        { total: 253, value: 'CASUALPLAY' },
        { total: 216, value: 'CONCORD' },
        { total: 179, value: 'JOIE' },
        { total: 126, value: 'MACLAREN' },
        { total: 92, value: 'MIMA' },
        { total: 92, value: 'RECARO' },
        { total: 61, value: 'MOUNTAIN-BUGGY' },
        { total: 52, value: 'BABYHOME' },
        { total: 48, value: 'BABYJOGGER' },
        { total: 43, value: 'BABYZEN' },
        { total: 40, value: 'NURSE' },
        { total: 32, value: 'CHICCO' },
        { total: 29, value: 'KLIPPAN' },
        { total: 26, value: 'AXKID' },
        { total: 26, value: 'EASYWALKER' },
        { total: 24, value: 'TRUNKI' },
        { total: 22, value: 'KIWISAC' },
        { total: 19, value: 'BABY MONSTERS' },
      ]
    });
    done();
  });
});
