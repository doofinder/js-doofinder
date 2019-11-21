// required for testing
import 'mocha';
import { should, expect } from 'chai';

// chai
should();

// config, utils & mocks
import * as cfg from './config';

// required for tests
import { Query, OrderType, TransformerOptions } from '../src/query';
import { QueryTypes } from '../src/types';

describe('Query', () => {
  context('Creation of the Query object', () => {
    it('should accept just a hashid', done => {
      // when
      const q = new Query(cfg.hashid);
      const params = q.getParams();

      // then
      params.hashid.should.equal(cfg.hashid);
      done();
    });

    it('should accept and copy another query', done => {
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

    it('should accept search parameters', done => {
      // given
      const params = {
        hashid: cfg.hashid,
        page: 2,
      };

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
    it('sets the query correctly', done => {
      // given
      const q = new Query();
      expect(q.text).to.be.undefined;

      // when
      q.searchText('bag');

      // then
      q.text.should.equal('bag');
      done();
    });

    it('clears the query correctly', done => {
      // given
      const q = new Query({ hashid: cfg.hashid, rpp: 20 });
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

    it('adds parameters correctly', done => {
      // given
      const q = new Query({ hashid: cfg.hashid, rpp: 20 });

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

    it('alters parameters correctly', done => {
      // given
      const q = new Query({ hashid: cfg.hashid, rpp: 20 });

      // when
      q.setParameter('rpp', 10);

      // then
      const params = q.getParams();
      params.should.have.property('hashid');
      params.should.have.property('rpp');

      params.rpp.should.be.equal(10);

      done();
    });

    it('setting several parameters at once correctly', done => {
      // given
      const q = new Query({ hashid: cfg.hashid, page: 2 });
      const newParams = { rpp: 10, transformer: TransformerOptions.Basic };

      // when
      q.setParameters(newParams);

      // then
      const params = q.dump();
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
    it('adds a filter term correctly', done => {
      // given
      const q = new Query({ hashid: cfg.hashid, rpp: 10, page: 2 });

      // when
      q.addFilter('brand', ['Ferrari']);

      // then
      const params = q.dump();
      params.should.have.property('filter');
      params.filter.should.have.property('brand');

      done();
    });

    it('removes a filter term correctly', done => {
      // given
      const q = new Query({ hashid: cfg.hashid, rpp: 10, page: 2 });
      q.addFilter('brand', ['Ferrari', 'ford']);

      // when
      q.removeFilter('brand', ['Ferrari']);

      // then
      const dump = q.dump();
      dump.should.have.property('filter');
      dump.filter.brand.should.not.include('Ferrari');

      done();
    });

    it('does not remove a filter term if not present', done => {
      // given
      const q = new Query({ hashid: cfg.hashid, rpp: 10, page: 2 });
      q.addFilter('brand', ['Ferrari']);

      // when
      q.removeFilter('brand', ['Lamborghini']);

      // then
      const params = q.dump();
      params.should.have.property('filter');
      params.filter.should.have.property('brand');
      (params.filter.brand as Array<string>).length.should.be.equal(1);

      done();
    });

    it('toggling non existing filter adds it', done => {
      // given
      const q = new Query({ hashid: cfg.hashid, rpp: 10, page: 2 });

      // when
      q.toggleFilter('brand', 'Ferrari');

      // then
      const dump = q.dump();
      dump.should.have.property('filter');
      dump.filter.should.have.property('brand');

      done();
    });

    it('toggling existing filter removes it', done => {
      // given
      const q = new Query({ hashid: cfg.hashid, rpp: 10, page: 2 });
      q.addFilter('brand', ['Ferrari']);

      // when
      q.toggleFilter('brand', ['Ferrari']);

      // then
      const dump = q.dump();
      dump.should.have.property('filter');
      dump.filter.should.have.property('brand');
      dump.filter.brand.should.be.empty;

      done();
    });

    it('check a filter exists correctly', done => {
      // given
      const q = new Query({ hashid: cfg.hashid, rpp: 10, page: 2 });
      q.addFilter('brand', ['Ferrari']);

      // then
      expect(q.hasFilter('brand', 'Ferrari')).to.be.true;
      expect(q.hasFilter('brand', 'Lamborghini')).to.be.false;
      expect(q.hasFilter('brand')).to.be.true;
      expect(q.hasFilter('make')).to.be.false;

      done();
    });
  });

  context('Query sorting parameter methods', () => {
    it('adding sort parameters when sort is a string', done => {
      // when
      const q = new Query();
      q.addSort('color', 'asc');

      // then
      q.sort.should.deep.include({ color: OrderType.ASC });

      done();
    });

    it('adding sort parameters when sort is an object', done => {
      // when
      const q = new Query();
      q.addSort([{ color: 'desc' }]);

      // then
      q.sort.should.deep.include({ color: OrderType.DESC });

      done();
    });

    it('setting the sort parameters works', done => {
      // given
      const q = new Query({
        hashid: cfg.hashid,
        rpp: 10,
        page: 2,
        sort: [{ price: OrderType.ASC }, { color: OrderType.ASC }],
      });

      // when
      q.addSort([{ size: OrderType.DESC }, { name: OrderType.ASC }]);

      // then
      const params = q.getParams();
      q.sort.length.should.be.equal(2);
      q.sort.should.deep.include({ size: OrderType.DESC });
      q.sort.should.deep.include({ name: OrderType.ASC });
      q.sort.should.not.deep.include({ price: OrderType.ASC });
      q.sort.should.not.deep.include({ color: OrderType.ASC });

      done();
    });

    it('hasSorting returns proper values when asked', done => {
      // given
      const q = new Query();
      q.addSort([{ price: OrderType.ASC }, { color: OrderType.ASC }]);
      // then
      q.hasSorting('price').should.be.true;
      q.hasSorting('color').should.be.true;
      q.hasSorting('size').should.be.false;

      done();
    });

    it('hasSorting returns proper values when string sorting', done => {
      // given
      const q = new Query();
      q.addSort('color');

      // then
      q.hasSorting('color').should.be.true;
      q.hasSorting('price').should.be.false;

      done();
    });

    it('hasSorting when it is an object works', done => {
      // given
      const q = new Query({ hashid: cfg.hashid, rpp: 10, page: 2 });
      q.addSort([{ color: OrderType.ASC }])

      // then
      q.hasSorting('color').should.be.true;
      q.hasSorting('price').should.be.false;

      done();
    });

    it('hasSorting when there is no sorting works', done => {
      // given
      const q = new Query();

      // then
      q.hasSorting('color').should.be.false;
      q.hasSorting('price').should.be.false;

      done();
    });
  });

  context('Query page parameter methods', () => {
    it('page should be set correctly', done => {
      // given
      const q = new Query({ hashid: cfg.hashid });

      // when
      q.page(3);

      // then
      const queryDump = q.dump();
      queryDump.page.should.be.equal(3);
      done();
    });

    it('next page should be set correctly', done => {
      // given
      const pageNum = Math.floor(Math.random() * 10 + 1);
      const q = new Query({ hashid: cfg.hashid });
      q.page(pageNum)

      // when
      q.nextPage();

      // then
      q.dump().page.should.be.equal(pageNum + 1);
      done();
    });

    it('next page should set page to two if none in Query', done => {
      // given
      const q = new Query({ hashid: cfg.hashid });

      // when
      q.nextPage();

      // then
      q.dump().page.should.be.equal(2);
      done();
    });

    it('results per page works as intended', done => {
      // given
      const q = new Query({ hashid: cfg.hashid, rpp: 10 });

      // when
      q.resultsPerPage(20);

      // then
      q.dump().rpp.should.be.equal(20);
      done();
    });

    it('results per page can be reset with empty call', done => {
      // given
      const q = new Query({ hashid: cfg.hashid });
      q.resultsPerPage(10);

      // when
      q.resultsPerPage();

      // then
      q.dump().should.not.have.property('rpp');
      done();
    });
  });

  context('Query type parameter methods', () => {
    it('set type works correctly', done => {
      // given
      const q = new Query({ hashid: cfg.hashid, rpp: 10, type: ['blog', 'employees'] });

      // when
      q.setTypes('product');

      // then
      const params = q.getParams();
      params.should.have.property('type');
      params.type.should.be.equal('product');

      done();
    });

    it('adding a type works correctly', done => {
      // given
      const q = new Query({ hashid: cfg.hashid, rpp: 10, type: ['blog', 'employees'] });

      // when
      q.addType('product');

      // then
      const params = q.getParams();
      params.should.have.property('type');
      params.type.length.should.be.equal(3);
      params.type.should.include('product');

      done();
    });

    it('adding types transforms into an array', done => {
      // given
      const q = new Query({ hashid: cfg.hashid, rpp: 10, type: 'product' });

      // when
      q.addType('blog');

      // then
      const params = q.getParams();
      params.should.have.property('type');
      params.type.length.should.be.equal(2);
      params.type.should.include('product');
      params.type.should.include('blog');

      done();
    });

    it('removing a type works correctly', done => {
      // given
      const q = new Query({ hashid: cfg.hashid, rpp: 10, type: ['blog', 'employees'] });

      // when
      q.removeType('employees');

      // then
      const params = q.getParams();
      params.should.have.property('type');
      params.type.length.should.be.equal(1);
      params.type.should.not.include('employees');

      done();
    });

    it('removing a type that is not there works correctly', done => {
      // given
      const q = new Query({ hashid: cfg.hashid, rpp: 10, type: ['blog', 'employees'] });

      // when
      q.removeType('product');

      // then
      const params = q.getParams();
      params.should.have.property('type');
      params.type.length.should.be.equal(2);
      params.type.should.include('blog');
      params.type.should.include('employees');

      done();
    });

    it('empty call empties the types', done => {
      // given
      const q = new Query({ hashid: cfg.hashid, rpp: 10, type: ['blog', 'employees'] });

      // when
      q.setTypes();

      // then
      const params = q.getParams();
      params.should.not.have.property('type');

      done();
    });
  });

  context('Other Query parameter methods', () => {
    it('Sets the transformer correctly', done => {
      // given
      const q = new Query({ hashid: cfg.hashid });

      // when
      q.transformer(TransformerOptions.Basic);

      // then
      q.dump().transformer.should.be.equal(TransformerOptions.Basic);
      done();
    });

    it('Clears the transformer correctly', done => {
      // given
      const q = new Query({ hashid: cfg.hashid });
      q.transformer(TransformerOptions.Basic);

      // when
      q.transformer();

      // then
      q.dump().should.not.have.property('transformer');
      done();
    });

    it('Sets the timeout correctly', done => {
      // given
      const q = new Query({ hashid: cfg.hashid, rpp: 20 });

      // when
      q.timeout(100);

      // then
      q.getParams().timeout.should.be.equal(100);
      done();
    });

    it('Clears the timeout correctly', done => {
      // given
      const q = new Query({ hashid: cfg.hashid, rpp: 20, timeout: 100 });

      // when
      q.timeout();

      // then
      q.getParams().should.not.have.property('timeout');
      done();
    });

    it('Sets the jsonp correctly', done => {
      // given
      const q = new Query({ hashid: cfg.hashid, rpp: 20 });

      // when
      q.jsonp(true);

      // then
      q.getParams().jsonp.should.be.true;
      done();
    });

    it('Clears the jsonp correctly', done => {
      // given
      const q = new Query({ hashid: cfg.hashid, rpp: 20, jsonp: true });

      // when
      q.jsonp();

      // then
      q.getParams().should.not.have.property('jsonp');
      done();
    });

    it('Sets the query_name correctly', done => {
      // given
      const q = new Query({ hashid: cfg.hashid, rpp: 20 });

      // when
      q.queryName(QueryTypes.MatchAnd);

      // then
      q.getParams().query_name.should.be.equal(QueryTypes.MatchAnd);
      done();
    });

    it('Clears the query_name correctly', done => {
      // given
      const q = new Query({ hashid: cfg.hashid, rpp: 20, query_name: QueryTypes.MatchAnd });

      // when
      q.queryName();

      // then
      q.getParams().should.not.have.property('query_name');
      done();
    });

    it('Sets the nostats correctly', done => {
      // given
      const q = new Query({ hashid: cfg.hashid, rpp: 20 });

      // when
      q.noStats(true);

      // then
      q.getParams().nostats.should.be.equal(1);
      done();
    });

    it('Clears the nostats correctly', done => {
      // given
      const q = new Query({ hashid: cfg.hashid, rpp: 20, nostats: 1 });

      // when
      q.noStats();

      // then
      q.getParams().should.not.have.property('nostats');
      done();
    });
  });

  context('Parameter checking and fetching', () => {
    it('hasParameter returns true if the parameter exists', done => {
      // when
      const q = new Query({ hashid: cfg.hashid, rpp: 20, page: 11 });

      // then
      q.hasParameter('rpp').should.be.true;
      q.hasParameter('page').should.be.true;
      q.hasParameter('url').should.be.false;

      done();
    });

    it('getParams returns the current params', done => {
      // when
      const q = new Query({ hashid: cfg.hashid, rpp: 20, page: 11 });

      // then
      const params = q.getParams();
      params.should.have.property('hashid');
      params.should.have.property('rpp');
      params.should.have.property('page');

      done();
    });

    it('getParams returns the current params, even the new ones', done => {
      // given
      const q = new Query({ hashid: cfg.hashid, rpp: 20, page: 11 });

      // when
      q.queryName(QueryTypes.Fuzzy);

      // then
      const params = q.getParams();
      params.should.have.property('hashid');
      params.should.have.property('rpp');
      params.should.have.property('page');
      params.should.have.property('query_name');

      done();
    });

    it('getQuery works correctly', done => {
      // given
      const q = new Query({ hashid: cfg.hashid, rpp: 20, page: 11 });

      // when
      q.searchText('smartphone');

      // then
      q.text.should.be.equal('smartphone');

      done();
    });
  });
});
