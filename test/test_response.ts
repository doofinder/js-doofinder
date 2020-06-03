// required for testing
import 'mocha';
import { should, expect } from 'chai';
import { basicResponse } from './fixtures/basic_response';

import { _processSearchResponse, SearchResponse } from '../src/response';
import { clone } from '../src/util/clone';

// chai
should();

describe('Search Response', () => {
  const response: SearchResponse = _processSearchResponse(clone(basicResponse));

  it('should save a copy of received facets', done => {
    response._rawFacets.should.eql(basicResponse.facets);
    done();
  });

  it('should properly transform range facets', done => {
    response.facets.best_price.should.be.eql({
      type: 'range',
      label: '',
      range: {
        avg: 283.44241397604185,
        count: 2295,
        max: 1490.0,
        min: 0.0,
        sum: 650500.340075016
      }
    });
    done();
  });

  it('should properly transform basic terms facets', done => {
    response.facets.brand.should.be.eql({
      type: 'terms',
      label: '',
      terms: [
        { doc_count: 426, key: 'JANE', selected: true },
        { doc_count: 275, key: 'BE COOL' },
        { doc_count: 253, key: 'CASUALPLAY' },
        { doc_count: 216, key: 'CONCORD' },
        { doc_count: 179, key: 'JOIE' },
        { doc_count: 126, key: 'MACLAREN' },
        { doc_count: 92, key: 'MIMA' },
        { doc_count: 92, key: 'RECARO' },
        { doc_count: 61, key: 'MOUNTAIN-BUGGY' },
        { doc_count: 52, key: 'BABYHOME' },
        { doc_count: 48, key: 'BABYJOGGER' },
        { doc_count: 43, key: 'BABYZEN' },
        { doc_count: 40, key: 'NURSE' },
        { doc_count: 32, key: 'CHICCO' },
        { doc_count: 29, key: 'KLIPPAN' },
        { doc_count: 26, key: 'AXKID' },
        { doc_count: 26, key: 'EASYWALKER' },
        { doc_count: 24, key: 'TRUNKI' },
        { doc_count: 22, key: 'KIWISAC' },
        { doc_count: 19, key: 'BABY MONSTERS' },
      ]
    });
    done();
  });

  it('should properly sort terms with unknown doc_count', done => {
    response.facets.price_range_slot.should.be.eql({
      type: 'terms',
      label: '',
      terms: [
        { doc_count: null, key: "0 - 20", from: 0, to: 20 },
        { doc_count: null, key: "20 - 50", from: 20, to: 50 },
        { doc_count: null, key: "50 - 90", from: 50, to: 90 },
        { doc_count: null, key: "90 - 180", from: 90, to: 180 },
        { doc_count: null, key: "180 - 540", from: 180, to: 540 },
        { doc_count: null, key: "540", from: 540, }
      ]
    });
    done();
  });

  it('should properly sort terms artificially added by the server', done => {
    response.facets.categories.should.be.eql({
      type: 'terms',
      label: '',
      terms: [
        { doc_count: 915, key: 'Ofertas - Outlet', selected: true },
        { doc_count: 881, key: 'Cochecitos de bebé' },
        { doc_count: 711, key: 'Sillas de paseo bebé' },
        { doc_count: 632, key: 'Sillas de coche bebé' },
        { doc_count: 603, key: 'Conjuntos de 2 o 3 piezas' },
        { doc_count: 419, key: 'Sillas de paseo', selected: true },
        { doc_count: 384, key: 'Individuales' },
        { doc_count: 371, key: 'Cochecitos de bebé Jane' },
        { doc_count: 311, key: 'Cochecitos bebé - Conjunto de 2 o 3 piezas' },
        { doc_count: 288, key: 'Sillas de coche con isofix bebé' },
        { doc_count: 275, key: 'Accesorios Cochecitos' },
        { doc_count: 272, key: 'Sillas de coche y cochecitos Be Cool' },
        { doc_count: 253, key: 'Conjuntos 2 piezas' },
        { doc_count: 227, key: 'Cochecitos y sillas de coche Casualplay' },
        { doc_count: 214, key: 'Conjuntos 3 piezas' },
        { doc_count: 202, key: 'Sillas de coche sin isofix bebé' },
        { doc_count: 193, key: 'Sillas de coche y cochecitos Concord' },
        { doc_count: 178, key: 'Sillas de coche y sillas de paseo Joie' },
        { doc_count: 135, key: 'Grupo 0-0+ (0 - 13kg)' },
        { doc_count: 135, key: 'Grupo 2-3 (15 - 36kg)' },
        { doc_count: 1, key: 'Capazo solo', selected: true }, // artifically added by the server
        { doc_count: null, key: 'Special Value' },
      ]
    });
    done();
  });
});
