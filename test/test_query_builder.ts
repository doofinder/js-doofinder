// required for testing
import 'mocha';
import { should, expect } from 'chai';

// chai
should();

// config, utils & mocks
import * as cfg from './config';

// required for tests
import { Query, OrderType } from '../src';
import {buildQueryString} from "../src/util/encode-params";

describe('Query', () => {
  context('Creation of the Query object', () => {
    it('should accept just a hashid', done => {
      // when
      const q = new Query(cfg);
      const params = q.dump();

      // then
      params.hashid.should.equal(cfg.hashid);
      done();
    });

    it('should accept and copy another query', done => {
      // given
      const qOriginal = new Query(cfg);
      const paramsOriginal = qOriginal.dump();

      // when
      const qCopy = new Query(cfg);
      qCopy.load(paramsOriginal);
      const paramsCopy = qCopy.dump();

      // then
      (qOriginal === qCopy).should.not.be.true;
      paramsCopy.hashid.should.equal(paramsOriginal.hashid);

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

    it('setting several parameters at once correctly', done => {
      // given
      const q = new Query(cfg);
      q.page(2);
      const newParams = { rpp: 10, transformer: 'basic' };

      // when
      q.load(newParams);

      // then
      const params = q.dump();
      params.should.have.property('hashid');
      params.should.have.property('rpp');
      params.should.have.property('page');
      params.should.have.property('transformer');

      params.rpp.should.be.equal(10);
      params.transformer.should.be.equal('basic');

      done();
    });
  });

  context('Query filter methods', () => {
    it('adds a filter term correctly', done => {
      // given
      const q = new Query(cfg);
      q.rpp(10);
      q.page(2);

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
      const q = new Query(cfg);
      q.rpp(10);
      q.page(2);
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
      const q = new Query(cfg);
      q.rpp(10);
      q.page(2);
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
      const q = new Query(cfg);
      q.rpp(10);
      q.page(2);

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
      const q = new Query(cfg);
      q.rpp(10);
      q.page(2);
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
      const q = new Query(cfg);
      q.rpp(10);
      q.page(2);
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
      q.sort('color', 'asc');

      // then
      q.getSort.should.deep.include({ color: OrderType.ASC });

      done();
    });

    it('adding sort parameters when sort is an object', done => {
      // when
      const q = new Query();
      q.sort([{ color: 'desc' }]);

      // then
      q.getSort.should.deep.include({ color: OrderType.DESC });

      done();
    });

    it('setting the sort parameters works', done => {
      // given
      const q = new Query(cfg);
      q.rpp(10);
      q.page(2);
      q.sort([{ price: OrderType.ASC }, { color: OrderType.ASC }]);

      // when
      q.sort([{ size: OrderType.DESC }, { name: OrderType.ASC }]);

      // then
      q.getSort.length.should.be.equal(2);
      q.getSort.should.deep.include({ size: OrderType.DESC });
      q.getSort.should.deep.include({ name: OrderType.ASC });
      q.getSort.should.not.deep.include({ price: OrderType.ASC });
      q.getSort.should.not.deep.include({ color: OrderType.ASC });

      done();
    });

    it('hasSorting returns proper values when asked', done => {
      // given
      const q = new Query();
      q.sort([{ price: OrderType.ASC }, { color: OrderType.ASC }]);
      // then
      q.hasSorting('price').should.be.true;
      q.hasSorting('color').should.be.true;
      q.hasSorting('size').should.be.false;

      done();
    });

    it('hasSorting returns proper values when string sorting', done => {
      // given
      const q = new Query();
      q.sort('color');

      // then
      q.hasSorting('color').should.be.true;
      q.hasSorting('price').should.be.false;

      done();
    });

    it('hasSorting when it is an object works', done => {
      // given
      const q = new Query(cfg);
      q.rpp(10);
      q.page(2);
      q.sort([{ color: OrderType.ASC }]);

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
      const q = new Query(cfg);

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
      const q = new Query(cfg);
      q.page(pageNum);

      // when
      q.nextPage();

      // then
      q.dump().page.should.be.equal(pageNum + 1);
      done();
    });

    it('next page should set page to two if none in Query', done => {
      // given
      const q = new Query(cfg);

      // when
      q.nextPage();

      // then
      q.dump().page.should.be.equal(2);
      done();
    });

    it('results per page works as intended', done => {
      // given
      const q = new Query(cfg);
      q.rpp(10);

      // when
      q.rpp(20);

      // then
      q.dump().rpp.should.be.equal(20);
      done();
    });

    it('results per page can be reset with empty call', done => {
      // given
      const q = new Query(cfg);
      q.rpp(10);

      // when
      q.rpp();

      // then
      q.dump().should.not.have.property('rpp');
      done();
    });
  });

  context('Query type parameter methods', () => {
    it('set type works correctly', done => {
      // given
      const q = new Query(cfg);
      q.types(['blog', 'employees']);

      // when
      q.types('product');

      // then
      const params = q.dump();
      params.should.have.property('type');
      params.type.should.be.eql(['product']);

      done();
    });

    it('removing a type works correctly', done => {
      // given
      const q = new Query(cfg);
      q.types(['blog', 'employees']);

      // when
      q.types();

      // then
      const params = q.dump();
      params.should.not.have.property('type');

      done();
    });

    it('empty call empties the types', done => {
      // given
      const q = new Query(cfg);
      q.types(['blog', 'employees']);

      // when
      q.types();

      // then
      const params = q.dump();
      params.should.not.have.property('type');

      done();
    });
  });

  context('Other Query parameter methods', () => {
    it('Sets the transformer correctly', done => {
      // given
      const q = new Query(cfg);

      // when
      q.transformer('basic');

      // then
      q.dump().transformer.should.be.equal('basic');
      done();
    });

    it('Clears the transformer correctly', done => {
      // given
      const q = new Query(cfg);
      q.transformer('basic');

      // when
      q.transformer();

      // then
      q.dump().should.not.have.property('transformer');
      done();
    });

    it('Set transformer null and check the querystring', done => {
      const query = new Query({ hashid: '123456' });
      query.searchText('portatil');
      query.transformer(null);
      const params = query.dump();

      //then
      params.transformer.should.be.equal('');
      buildQueryString(params).should.be.equal('hashid=123456&query=portatil&transformer=');
      done();
    })

    it('Sets the timeout correctly', done => {
      // given
      const q = new Query(cfg);
      q.rpp(20);

      // when
      q.timeout(100);

      // then
      q.dump().timeout.should.be.equal(100);
      done();
    });

    it('Clears the timeout correctly', done => {
      // given
      const q = new Query(cfg);
      q.rpp(20);
      q.timeout(100);

      // when
      q.timeout();

      // then
      q.dump().should.not.have.property('timeout');
      done();
    });

    it('Sets the jsonp correctly', done => {
      // given
      const q = new Query(cfg);
      q.rpp(20);

      // when
      q.jsonp(true);

      // then
      q.dump().jsonp.should.be.true;
      done();
    });

    it('Clears the jsonp correctly', done => {
      // given
      const q = new Query(cfg);
      q.rpp(20);
      q.jsonp(true);

      // when
      q.jsonp();

      // then
      q.dump().should.not.have.property('jsonp');
      done();
    });

    it('Sets the query_name correctly', done => {
      // given
      const q = new Query(cfg);

      // when
      q.queryName('match_and');

      // then
      q.dump().query_name.should.be.equal('match_and');
      done();
    });

    it('Clears the query_name correctly', done => {
      // given
      const q = new Query(cfg);
      q.queryName('match_and');

      // when
      q.queryName();

      // then
      q.dump().should.not.have.property('query_name');
      done();
    });

    it('Sets the nostats correctly', done => {
      // given
      const q = new Query(cfg);

      // when
      q.noStats(true);

      // then
      q.dump().nostats.should.be.equal(1);
      done();
    });

    it('Clears the nostats correctly', done => {
      // given
      const q = new Query(cfg);
      q.noStats(true);

      // when
      q.noStats();

      // then
      q.dump().should.not.have.property('nostats');
      done();
    });
  });

  context('Parameter checking and fetching', () => {
    it('getParams returns the current params', done => {
      // when
      const q = new Query(cfg);
      q.rpp(20);
      q.page(11);

      // then
      const params = q.dump();
      params.should.have.property('hashid');
      params.should.have.property('rpp');
      params.should.have.property('page');

      done();
    });

    it('getParams returns the current params, even the new ones', done => {
      // given
      const q = new Query(cfg);
      q.rpp(10);
      q.page(3);

      // when
      q.queryName('fuzzy');

      // then
      const params = q.dump();
      params.should.have.property('hashid');
      params.should.have.property('rpp');
      params.should.have.property('page');
      params.should.have.property('query_name');

      done();
    });

    it('getQuery works correctly', done => {
      // given
      const q = new Query(cfg);
      q.rpp(20);
      q.page(11);

      // when
      q.searchText('smartphone');

      // then
      q.text.should.be.equal('smartphone');

      done();
    });
  });
});
