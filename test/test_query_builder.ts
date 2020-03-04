// required for testing
import 'mocha';
import { should, expect } from 'chai';

// chai
should();

// config, utils & mocks
import * as cfg from './config';

// required for tests
import { Query, QueryFilter } from '../src';
import {buildQueryString} from "../src/util/encode-params";

describe('QueryFilter', () => {
  const filter = new QueryFilter();

  beforeEach(() => {
    filter.clear();
  });

  context('empty QueryFilter', () => {
    it('should dump as undefined', (done) => {
      expect(filter.dump()).to.be.undefined;
      done();
    })
  });

  context('set filters', () => {
    it('can set terms filters from a single value', (done) => {
      filter.set('brand', 'adidas');
      filter.set('number', 3);
      filter.dump().should.eql({
        brand: ['adidas'],
        number: [3]
      });
      done();
    });
    it('can set terms filters from an array of values', (done) => {
      filter.set('brand', ['adidas', 'nike']);
      filter.set('number', [1, 3, 5]);
      filter.dump().should.eql({
        brand: ['adidas', 'nike'],
        number: [1, 3, 5]
      });
      done();
    });
    it('can set filters from a plain object', (done) => {
      filter.set('geo_distance', {
        distance: '200km',
        position: '40,-70'
      });
      filter.set('best_price', {
        gt: 0,
        lte: 100
      });
      filter.dump().should.eql({
        geo_distance: {
          distance: '200km',
          position: '40,-70'
        },
        best_price: {
          gt: 0,
          lte: 100
        }
      });
      done();
    });
    it('throws if an empty object is passed', (done) => {
      (() => {
        filter.set('wrong', {});
      }).should.throw();
      done();
    });
    it(`can set unknown types at user's risk`, (done) => {
      const dt = new Date();
      filter.set('bool', true);
      filter.set('date', dt);
      filter.dump().should.eql({
        bool: true,
        date: dt
      });
      done();
    });
    it(`can manage arrays of unknown types at user's risk`, (done) => {
      filter.set('value', [{lte: 10}, {gte: 10}]);
      filter.get('value').should.eql([{lte: 10}, {gte: 10}]);
      done();
    })
  });

  context('filter checks', () => {
    const dt = new Date();

    beforeEach(() => {
      filter.set('brand', ['adidas', 'nike']);
      filter.set('geo_distance', {
        distance: '200km',
        position: '40,-70'
      });
      filter.set('bool', true);
      filter.set('number', 10);
      filter.set('date', dt);
    });

    it('can check if a filter is defined', (done) => {
      filter.has('brand').should.be.true;
      filter.has('unknown').should.be.false;
      done();
    });

    it('can check if a filter contains a value', (done) => {
      filter.contains('brand', 'adidas').should.be.true;
      filter.contains('brand', 'nike').should.be.true;
      filter.contains('brand', ['adidas', 'nike']).should.be.true;

      filter.contains('brand', 'puma').should.be.false;
      filter.contains('brand', ['adidas', 'nike', 'puma']).should.be.false;

      filter.contains('geo_distance', {
        distance: '200km',
        position: '40,-70'
      }).should.be.true;
      filter.contains('geo_distance', {
        distance: '100km',
        position: '40,-70'
      }).should.be.false;

      filter.contains('bool', true).should.be.true;
      filter.contains('bool', false).should.be.false;

      filter.contains('number', 10).should.be.true;
      filter.contains('number', 11).should.be.false;

      filter.contains('date', dt).should.be.true;

      done();
    });

    it('can check if a filter equals a value', (done) => {
      filter.equals('brand', 'adidas').should.be.false;
      filter.equals('brand', ['adidas', 'nike']).should.be.true;
      filter.equals('brand', ['adidas', 'nike', 'puma']).should.be.false;

      filter.equals('geo_distance', {
        distance: '200km',
        position: '40,-70'
      }).should.be.true;
      filter.equals('geo_distance', {
        distance: '100km',
        position: '40,-70'
      }).should.be.false;

      filter.contains('bool', true).should.be.true;
      filter.contains('bool', false).should.be.false;

      filter.contains('number', 10).should.be.true;
      filter.contains('number', 11).should.be.false;

      filter.contains('date', dt).should.be.true;

      done();
    });
  });

  context('get filters', () => {
    it('returns terms as an array', (done) => {
      filter.set('brand', 'adidas');
      filter.get('brand').should.eql(['adidas']);
      done();
    });
    it('returns other values as they are', (done) => {
      filter.set('value', {gte: 10});
      filter.get('value').should.eql({gte: 10});
      done();
    });
  });

  context('add filters', () => {
    it('can add filters from a single value', (done) => {
      filter.set('brand', 'adidas');
      filter.add('brand', 'adidas');
      filter.add('brand', 'nike');
      filter.get('brand').should.eql(['adidas', 'nike']);

      filter.set('value', {gte: 10});
      filter.add('value', {lte: 100});
      filter.get('value').should.eql({lte: 100});
      done();
    });
    it('can add terms filters from an array', (done) => {
      filter.set('brand', 'adidas');
      filter.add('brand', ['adidas', 'nike']);
      filter.get('brand').should.eql(['adidas', 'nike']);
      done();
    });
  });

  context('toggle filters', () => {
    it(`toggles a filter given the exact value`, (done) => {
      filter.toggle('brand', 'adidas');
      filter.get('brand').should.eql(['adidas']);
      filter.toggle('brand', 'adidas');
      expect(filter.get('brand')).to.be.undefined;

      filter.toggle('brand', ['adidas', 'nike']);
      filter.get('brand').should.eql(['adidas', 'nike']);
      (() => {
        filter.toggle('brand', 'adidas');
      }).should.throw;
      filter.toggle('brand', ['adidas', 'nike']);
      expect(filter.get('brand')).to.be.undefined;

      filter.toggle('value', true);
      filter.get('value').should.be.true;
      filter.toggle('value', true);
      expect(filter.get('value')).to.be.undefined;

      filter.toggle('best_price', {gte: 100, lte: 200});
      filter.get('best_price').should.eql({gte: 100, lte: 200});
      (() => {
        filter.toggle('best_price', {gte: 100});
      }).should.throw;
      filter.toggle('best_price', {gte: 100, lte: 200});
      expect(filter.get('best_price')).to.be.undefined;

      done();
    });
  });
});

describe('Query', () => {
  context('empty Query', () => {
    it('should dump defaults', (done) => {
      const query = new Query();
      query.dump().should.eql(query.defaults);
      done();
    });
  });

  context('reset Query', () => {
    it('should dump defaults', (done) => {
      const query = new Query();
      query.page = 10;
      query.reset();
      query.dump().should.eql(query.defaults);
      query.text.should.equal('');
      done();
    });
  });

  context('new Query', () => {
    it ('should accept initial params', (done) => {
      const initial = {
        query: 'chair',
        page: 2,
        rpp: 10,
        type: ['product', 'article'],
        filter: {
          brand: ['adidas']
        },
        exclude: {
          brand: ['nike']
        }
      };
      const query = new Query(initial);
      query.dump().should.eql(initial);
      done();
    });
  });

  context('regular Query', () => {
    const query = new Query();

    beforeEach(() => {
      query.reset();
    });

    it('can be copied', (done) => {
      query.text = 'chair';
      query.types.add('product');
      query.filters.add('brand', 'adidas');

      const copy = new Query(query.dump());
      copy.dump().should.eql({
        query: 'chair',
        page: 1,
        rpp: 20,
        type: ['product'],
        filter: {
          brand: ['adidas']
        }
      });
      done();
    });

    it('can be validated', (done) => {
      // TODO: implement Query.isValid();
      // - params (hashid, page, rpp)
      // - filters (geo distance…)
      // - sort (geo distance…)
      done();
    });

    context('query properties', () => {
      it('properly sets basic parameters', (done) => {
        query.hashid = 'asdf';
        query.text = 'blah';
        query.transformer = 'basic';
        query.queryName = 'match_and';

        query.hashid.should.equal('asdf');
        query.text.should.equal('blah');
        query.transformer.should.equal('basic');
        query.queryName.should.equal('match_and');

        query.dump().should.eql({
          hashid: 'asdf',
          query: 'blah',
          page: 1,
          rpp: 20,
          transformer: 'basic',
          query_name: 'match_and'
        });
        done();
      });
      it('properly sets page', (done) => {
        query.page++;
        query.page.should.equal(2);
        query.page = 7;
        query.page.should.equal(7);
        query.dump().page.should.equal(7);

        (() => query.page = 0).should.throw;
        (() => query.page = -1).should.throw;
        // @ts-ignore
        (() => query.page = 'wrong').should.throw;

        done();
      });
      it('properly sets rpp', (done) => {
        query.rpp = 30;
        query.rpp.should.equal(30);
        query.dump().rpp.should.equal(30);

        (() => query.rpp = 0).should.throw;
        (() => query.rpp = -1).should.throw;
        (() => query.rpp = 101).should.throw;
        // @ts-ignore
        (() => query.rpp = 'wrong').should.throw;
        done();
      });
      it('properly sets query counter', (done) => {
        query.queryCounter++;
        expect(query.queryCounter).to.be.undefined;
        query.queryCounter = 1;
        query.queryCounter.should.equal(1);
        query.queryCounter++;
        query.queryCounter.should.equal(2);
        query.queryCounter = undefined;
        expect(query.queryCounter).to.be.undefined;
        done();
      });
      it('properly sets nostats flag', (done) => {
        query.noStats.should.be.false;
        query.noStats = true;
        query.noStats.should.be.true;
        query.dump().nostats.should.be.true;
        query.noStats = false;
        query.noStats.should.be.false;
        expect(query.dump().nostats).to.be.undefined;
        done();
      });
      it('properly sets types', (done) => {
        expect(query.dump().type).to.be.undefined;

        query.types.add('product');
        query.dump().type.should.eql(['product']);

        query.types.add('article');
        query.dump().type.should.eql(['product', 'article']);
        done();
      });
    });

    context('custom params', () => {
      it('can get and set custom params', (done) => {
        query.setParam('value', 3);
        query.getParam('value').should.equal(3);

        query.setParam('list', ['a', 'b', 'c']);
        query.getParam('list').should.eql(['a', 'b', 'c']);

        query.setParam('obj', {a: 1, b: 2, c: 3});
        query.getParam('obj').should.eql({a: 1, b: 2, c: 3});

        done();
      });
      it('removes param if value is undefined', (done) => {
        query.load({
          value: 3,
          list: ['a', 'b', 'c'],
          obj: {a: 1, b: 2, c: 3}
        });
        query.dump().should.eql({
          ...query.defaults,
          value: 3,
          list: ['a', 'b', 'c'],
          obj: {a: 1, b: 2, c: 3}
        })

        query.setParam('value', undefined);
        expect(query.getParam('value')).to.be.undefined;

        query.setParam('list', undefined);
        expect(query.getParam('list')).to.be.undefined;

        query.setParam('obj', undefined);
        expect(query.getParam('obj')).to.be.undefined;
        done();

        query.dump().should.eql(query.defaults);
      });
    });

    context('sorting', () => {
      it('can load sorting and dump sorting', (done) => {
        query.load({
          sort: [
            'brand',
            {best_price: 'desc'},
            {geo_distance: {position: '40,-70', order: 'asc'}}
          ]
        });
        const result = [
          {brand: 'asc'},
          {best_price: 'desc'},
          {geo_distance: {position: '40,-70', order: 'asc'}}
        ];
        query.sort.get().should.eql(result);
        query.dump().sort.should.eql(result);
        done();
      });
      it('can set sorting', (done) => {
        query.sort.set('brand');
        query.sort.get().should.eql([{brand: 'asc'}]);
        query.sort.set([
          'brand',
          {best_price: 'desc'},
          {geo_distance: {position: '40,-70', order: 'asc'}}
        ]);
        query.sort.get().should.eql([
          {brand: 'asc'},
          {best_price: 'desc'},
          {geo_distance: {position: '40,-70', order: 'asc'}}
        ]);
        done();
      });
      it('can add sorting', (done) => {
        query.sort.add('brand');
        query.sort.add('best_price', 'desc');
        query.sort.add({geo_distance: {location: '40,-70', order: 'desc'}});
        query.sort.get().should.eql([
          {brand: 'asc'},
          {best_price: 'desc'},
          {geo_distance: {location: '40,-70', order: 'desc'}}
        ]);
        done();
      });
      it('can reset sorting', (done) => {
        query.sort.add('brand');
        query.sort.clear();
        query.sort.get().should.eql([]);
        expect(query.dump().sort).to.be.undefined;
        done();
      });
    });
  });
});
