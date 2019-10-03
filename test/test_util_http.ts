// required for testing
import * as mocha from 'mocha';
import * as chai from 'chai';
import * as fetchMock from 'fetch-mock';

// chai
chai.should();
const expect = chai.expect;


// required for tests
import { HttpClient } from  '../src/util/http';

describe("HttpClient", () => {
  const client = new HttpClient();

  beforeEach(() => {
    fetchMock.get('http://example.com/test', {body: {value: true}, status: 200});
    fetchMock.get('http://example.com/error', {body: {message: 'Invalid'}, status: 400});
    fetchMock.get('http://example.com/catastrophe', 503);
  });

  afterEach(() => {
    fetchMock.reset();
  });

  it("Receives data correctly", async () => {
    const response = await client.request('http://example.com/test');
    response.statusCode.should.be.equal(200);
    response.data.value.should.be.true;
  });

  it("Handles errors correctly", async () => {
    let response = await client.request('http://example.com/error');
    response.statusCode.should.be.equal(400);
    response.data.message.should.be.equal('Invalid');

    response = await client.request('http://example.com/catastrophe');
    response.statusCode.should.be.equal(503);
  });
});
