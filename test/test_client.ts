// required for testing
import * as mocha from 'mocha';
import * as chai from 'chai';

// chai
chai.should();
const expect = chai.expect;

// required for tests
import { Client } from '../src/doofinder';

// config, utils & mocks
import * as cfg from './config';

function buildQuery(query, params) {
  return cfg.getClient()._buildSearchQueryString(query, params);
}

// test
describe("Client", () => {
  context("Instantiation", () => {
    context("with invalid API key", () => {
      it("should break", (done) => {
        (() => new Client(cfg.hashid, {apiKey: "abcd"})).should.throw();
        done();
      });
    });

    context("with API Key and zone", () => {
      it("should use API key's zone", (done) => {
        const client = new Client(cfg.hashid, {zone: "us1", apiKey: "eu1-abcd"});
        (client as any).host.should.equal("eu1-search.doofinder.com");
        done();
      });
    });

    context("API version", () => {
      it("should use default version if not defined", (done) => {
        const client = cfg.getClient();
        (client as any).version.should.equal(`${cfg.version}`);
        done();
      });

      it("should use custom version if defined", (done) => {
        const client = new Client(cfg.hashid, {apiKey: cfg.apiKey, version: '6'});
        (client as any).version.should.equal("6");
        done();
      });
    });

    context("HTTP Headers", () => {
      it("should add passed headers to the request", (done) => {
        const client = new Client(cfg.hashid, {apiKey: cfg.apiKey, headers:
          {"X-Name": "John Smith"}});
        (client as any).requestOptions.headers["X-Name"].should.equal "John Smith"
        done()
      });

      it("forces SSL if 'Authorization' header is passed as option", (done) => {
        const client = new Client(cfg.hashid, { zone: "eu1", headers: {
          "Authorization": "abc"
        }});
        (client as any).requestOptions.headers["Authorization"].should.equal("abc");
        done();
      });

      it("won't replace API Keys passed in options", (done) => {
        const client = new Client(cfg.hashid, {apiKey: cfg.apiKey, headers: {
          "X-Name": "John Smith",
          "Authorization": "abc"
        }});
        (client as any).requestOptions.headers["X-Name"].should.equal("John Smith");
        (client as any).requestOptions.headers["Authorization"].should.equal("aaaaaaaaaabbbbbbbbbbccccccccccdddddddddd");
        done();
      });
    });

    context("Custom Address", () => {
      it("should use default address if not defined", (done) => {
        const client = cfg.getClient();
        (client as any).requestOptions.host.should.equal(cfg.host);
        expect((client as any).requestOptions.port).to.be.undefined;
        done();
      });

      it("should use custom address if defined", (done) => {
        const client = new Client(cfg.hashid, {apiKey: cfg.apiKey, address: "localhost:4000"});
        (client as any).requestOptions.host.should.equal("localhost");
        (client as any).requestOptions.port.should.equal("4000");
        done();
      });
    });
  });

  context("Request", () => {
    it("needs a path and a callback", (done) => {
      // TODO: Here we need to mock the fetch API to 
      // return things
      const client = cfg.getClient();
      client.request.should.throw();
      (() => client.request("/somewhere")).should.throw();
      (() => client.request("/somewhere", () => {})).should.not.throw();
      done();
    });

    it("handles request errors via callbacks", (done) => {
      // TODO: Mock the fetch API to return an error
      const scope = serve.requestError({code: "AWFUL_ERROR"});
      cfg.getClient().request("/somewhere", (err, response) => {
        err.error.code.should.equal("AWFUL_ERROR");
        scope.isDone().should.be.true;
        done();
      });
    });

    it("handles response errors via callbacks (1)", (done) => {
      // TODO: Mock the fetch API to return a 404
      const scope = serve.request(404, '{"error":"search engine not found"}');
      cfg.getClient().request("/somewhere", (err, response) => {
        err.statusCode.should.equal(404);
        err.error.should.equal("search engine not found");
        (expect(response)).to.be.undefined;
        scope.isDone().should.be.true;
        done();
      });
    });

    it("handles response errors via callbacks (2)", (done) => {
      // TODO: Mock the fetch API to return a 503
      const scope = serve.request(503, "Internal Server Error");
      cfg.getClient().request("/somewhere", (err, response) => {
        err.statusCode.should.equal(503);
        err.error.should.equal("Internal Server Error");
        (expect(response)).to.be.undefined;
        scope.isDone().should.be.true;
        done();
      });
    });

    it("handles response success via callbacks", (done) => {
      // TODO: Normal request here with success
      const scope = serve.request();
      cfg.getClient().request("/somewhere", (err, response) => {
        (expect(err)).to.be.undefined;
        response.should.eql({});
        scope.isDone().should.be.true;
        done();
      });
    });
  });

  context("Options", () => {
    it("assumes callback and no suffix when called with one arguments", (done) => {
      // TODO: Mock options call here
      const scope = serve.options();
      const request = cfg.getClient().options((err, response) => {
        request.path.should.equal(`/${cfg.version}/options/${cfg.hashid}`);
        response.should.eql({});
        scope.isDone().should.be.true;
        done();
      });
    });

    it("assumes callback and suffix when called with two arguments", (done) => {
      // TODO: Mock options call here
      const scope = serve.options("example.com");
      const request = cfg.getClient().options("example.com", (err, response) => {
        request.path.should.equal(`/${cfg.version}/options/${cfg.hashid}?example.com`);
        response.should.eql({});
        scope.isDone().should.be.true;
        done();
      });
    });
  });

  context("Search", () => {
    it("can be called with 2 or 3 arguments; the last one must be a callback", (done) => {
      client = cfg.getClient()

      client.search.should.throw()
      (() => (client.search "something")).should.throw()
      (() => (client.search "something", {})).should.throw()

      scope = serve.search query: "something"
      (() => (client.search "something", {}, ->)).should.not.throw()
      scope.isDone().should.be.true

      scope = serve.search query: "something"
      (() => (client.search "something", ->)).should.not.throw()
      scope.isDone().should.be.true

      done()
    });

    context("Basic Parameters", () => {
      it("uses default basic parameters if none set", (done) => {
        querystring = "hashid=#{cfg.hashid}&query="
        buildQuery().should.equal querystring
        done()
      });

      it("accepts different basic parameters than the default ones", (done) => {
        querystring = "hashid=#{cfg.hashid}&page=2&rpp=100&hello=world&query="
        (buildQuery undefined, page: 2, rpp: 100, hello: "world").should.equal querystring
        done()
      });
    });

    context("Types", () => {
      it("specifies no type if no specific type was set", (done) => {
        querystring = "hashid=#{cfg.hashid}&query="
        (buildQuery undefined).should.equal querystring
        done()
      });

      it("handles one type if set", (done) => {
        querystring = "hashid=#{cfg.hashid}&type=product&query="
        (buildQuery undefined, type: "product").should.equal querystring
        (buildQuery undefined, type: ["product"]).should.equal querystring
        done()
      });

      it("handles several types if set", (done) => {
        querystring = [
          "hashid=#{cfg.hashid}&type%5B0%5D=product&type%5B1%5D=recipe",
          "&query="
        ].join ""
        (buildQuery undefined, type: ["product", "recipe"]).should.equal querystring
        done()
      });
    });

    context("Filters", () => {
      // Exclusion filters are the same with a different key so not testing here.

      it("handles terms filters", (done) => {
        querystring = [
          "hashid=#{cfg.hashid}&filter%5Bbrand%5D=NIKE",
          "&filter%5Bcategory%5D%5B0%5D=SHOES&filter%5Bcategory%5D%5B1%5D=SHIRTS",
          "&query="
        ].join ""
        params =
          filter:
            brand: "NIKE"
            category: ["SHOES", "SHIRTS"]
        (buildQuery undefined, params).should.equal querystring
        done()
      });

      it("handles range filters", (done) => {
        querystring = [
          "hashid=#{cfg.hashid}&filter%5Bprice%5D%5Bfrom%5D=0",
          "&filter%5Bprice%5D%5Bto%5D=150&query="
        ].join ""
        params =
          filter:
            price:
              from: 0
              to: 150
        (buildQuery undefined, params).should.equal querystring
        done()
      });
    });

    context("Sorting", () => {
      it("accepts a single field name to sort on", (done) => {
        querystring = "hashid=#{cfg.hashid}&sort=brand&query="
        (buildQuery undefined, sort: "brand").should.equal querystring
        done()
      });

      it("accepts an object for a single field to sort on", (done) => {
        querystring = "hashid=#{cfg.hashid}&sort%5Bbrand%5D=desc&query="
        sorting =
          brand: "desc"
        (buildQuery undefined, sort: sorting).should.equal querystring
        done()
      });

      it("fails with an object for a multiple fields to sort on", (done) => {
        sorting =
          "_score": "desc"
          brand: "asc"
        (-> (buildQuery undefined, sort: sorting)).should.throw()
        done()
      });

      it("accepts an array of objects for a multiple fields to sort on", (done) => {
        querystring = [
          "hashid=#{cfg.hashid}&sort%5B0%5D%5B_score%5D=desc",
          "&sort%5B1%5D%5Bbrand%5D=asc&query="
        ].join ""
        sorting = [
            "_score": "desc"
          ,
            brand: "asc"
        ]
        (buildQuery undefined, sort: sorting).should.equal querystring
        done()
      });
    });
  });

  context("Stats", () => {
    it("must be called with all arguments, the last one is the callback", (done) => {
      scope = serve.stats "count"
      client = cfg.getClient()
      client.stats.should.throw()
      (-> (client.stats "count", {})).should.throw()
      (-> (client.stats "count", {}, ->)).should.not.throw()
      scope.isDone().should.be.true
      done()
    });
  });
});
