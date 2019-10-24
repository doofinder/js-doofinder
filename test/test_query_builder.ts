// required for testing
import 'mocha';
import { should, expect } from 'chai';

// chai
should();

// config, utils & mocks
import * as cfg from './config';

// required for tests
import { Query } from '../src/query';
import { QueryTypes, TransformerOptions, DoofinderParameters,
 Facet, FacetOption, SearchParameters } from '../src/types';


describe('Query', () => {
  context('Creation of the Query object', () => {
    it('should accept just a hashid', (done) => {
      // when
      const q = new Query(cfg.hashid);
      const params = q.getParams();

      // then
      params.hashid.should.equal(cfg.hashid);
      done();
    });

    it('should accept and copy another query', (done) => {
      // given
      const qOriginal = new Query(cfg.hashid);
      const paramsOriginal = qOriginal.getParams();

      // when
      const qCopy = new Query(qOriginal);
      const paramsCopy = qCopy.getParams();

      // then
      (qOriginal === qCopy).should.not.be.true;
      paramsCopy.hashid.should.equal(paramsOriginal.hashid);
      
      done();
    });

    it('should accept search parameters', (done) => {
      // given
      const params = {
        hashid: cfg.hashid,
        page: 2
      }

      // when
      const q = new Query(params);

      // then
      q.getParams().hashid.should.equal(cfg.hashid);
      q.getParams().page.should.equal(2);
      q.getParams.should.not.have.property('rpp');

      done();
    });
  });

  context('Query low level parameter methods', () => {
    it('sets the query correctly', (done) => {
      // given
      let q = new Query();
      expect(q.getQuery()).to.be.undefined;

      // when
      q.search('bag');
      
      // then
      q.getQuery().should.equal('bag');
      done();
    });

    it('clears the query correctly', (done) => {
      // given
      let q = new Query({hashid: cfg.hashid, rpp: 20});
      let params = q.getParams();
      params.should.have.property('hashid');
      params.should.have.property('rpp');

      // when
      q.clear();

      // then
      params = q.getParams();
      params.should.not.have.property('hashid');
      params.should.not.have.property('rpp');
      params.should.not.have.property('query');

      done();
    });

    it('adds parameters correctly', (done) => {
      // given
      let q = new Query({hashid: cfg.hashid, rpp: 20});

      // when
      q.setParameter('page', 2);

      // then
      const params = q.getParams();
      params.should.have.property('hashid');
      params.should.have.property('rpp');
      params.should.have.property('page');

      params.page.should.be.equal(2);

      done();
    });
    
    it('alters parameters correctly', (done) => {
      // given
      let q = new Query({hashid: cfg.hashid, rpp: 20});

      // when
      q.setParameter('rpp', 10);

      // then
      const params = q.getParams();
      params.should.have.property('hashid');
      params.should.have.property('rpp');

      params.rpp.should.be.equal(10);

      done();
    });

    it('setting several parameters at once correctly', (done) => {
      // given
      let q = new Query({hashid: cfg.hashid, rpp: 20, page: 2});
      const newParams = {rpp: 10, transformer: TransformerOptions.Basic};

      // when
      q.setParameters(newParams);

      // then
      const params = q.getParams();
      params.should.have.property('hashid');
      params.should.have.property('rpp');
      params.should.have.property('page');
      params.should.have.property('transformer');

      params.rpp.should.be.equal(10);
      params.transformer.should.be.equal(TransformerOptions.Basic);

      done();
    });
  });

  context('Query filter methods', () => {
    it('adds a filter term correctly', (done) => {
      // given
      let q = new Query({hashid: cfg.hashid, rpp: 10, page: 2});

      // when
      q.addFilter('brand', ['Ferrari']);

      // then
      const params = q.getParams();
      params.should.have.property('filter');
      params.filter.should.have.property('brand');

      done();
    });

    it('removes a filter term correctly', (done) => {
      // given
      let q = new Query({hashid: cfg.hashid, rpp: 10, page: 2});
      q.addFilter('brand', ['Ferrari']);

      // when
      q.removeFilter('brand', ['Ferrari']);

      // then
      const params = q.getParams();
      params.should.have.property('filter');
      params.filter.brand.should.not.include('Ferrari');

      done();
    });
    
    it('does not remove a filter term if not present', (done) => {
      // given
      let q = new Query({hashid: cfg.hashid, rpp: 10, page: 2});
      q.addFilter('brand', ['Ferrari']);

      // when
      q.removeFilter('brand', ['Lamborghini']);

      // then
      const params = q.getParams();
      params.should.have.property('filter');
      params.filter.should.have.property('brand');
      (params.filter.brand as Array<string>).length.should.be.equal(1);

      done();
    });

    it('toggling non existing filter adds it', (done) => {
      // given
      let q = new Query({hashid: cfg.hashid, rpp: 10, page: 2});

      // when
      q.toggleFilter('brand', ['Ferrari']);

      // then
      const params = q.getParams();
      params.should.have.property('filter');
      params.filter.should.have.property('brand');

      done();
    });

    it('toggling existing filter removes it', (done) => {
      // given
      let q = new Query({hashid: cfg.hashid, rpp: 10, page: 2});
      q.addFilter('brand', ['Ferrari']);

      // when
      q.toggleFilter('brand', ['Ferrari']);

      // then
      const params = q.getParams();
      params.should.have.property('filter');
      params.filter.should.have.property('brand');
      params.filter.brand.should.be.empty;

      done();
    });

    it('check a filter exists correctly', (done) => {
      // given
      let q = new Query({hashid: cfg.hashid, rpp: 10, page: 2});
      q.addFilter('brand', ['Ferrari']);

      // then
      expect(q.hasFilter('brand', 'Ferrari')).to.be.true; 
      expect(q.hasFilter('brand', 'Lamborghini')).to.be.false; 
      expect(q.hasFilter('brand')).to.be.true;
      expect(q.hasFilter('make')).to.be.false;

      done();
    });

    it('setting filters by hand works as expected', (done) => {
      // given
      let q = new Query({hashid: cfg.hashid, rpp: 10, page: 2});
      q.addFilter('brand', ['Ferrari']);


      // when 
      q.setFilters({'model': ['F40'], 'color': ['red']});

      // then
      const params = q.getParams();
      params.filter.should.not.have.property('brand');
      params.filter.should.have.property('model');
      params.filter.should.have.property('color');

      done();
    });
  });

  context('Query parameter methods', () => {
    it('page should be set correctly', (done) => {
      // given
      let q = new Query({hashid: cfg.hashid, rpp: 10, page: 2});

      // when
      q.page(3);

      // then
      q.getParams().page.should.be.equal(3);
      done();
    });

    it('next Page should be set correctly', (done) => {
      // given
      const pageNum = Math.floor((Math.random() * 10) + 1);
      let q = new Query({hashid: cfg.hashid, rpp: 10, page: pageNum});

      // when
      q.nextPage();

      // then
      q.getParams().page.should.be.equal(pageNum + 1);
      done();
    });

    it('next page should set page to two if none in Query', (done) => {
      // given
      let q = new Query({hashid: cfg.hashid, rpp: 10});

      // when
      q.nextPage();

      // then
      q.getParams().page.should.be.equal(2);
      done();
    });

    it('results per page works as intended', (done) => {
      // given
      let q = new Query({hashid: cfg.hashid, rpp: 10});

      // when
      q.resultsPerPage(20);

      // then
      q.getParams().rpp.should.be.equal(20);
      done();
    });
    
    it('results per page can be reset with empty call', (done) => {
      // given
      let q = new Query({hashid: cfg.hashid, rpp: 10});

      // when
      q.resultsPerPage();

      // then
      q.getParams().should.not.have.property('rpp');
      done();
    });
  });
});
