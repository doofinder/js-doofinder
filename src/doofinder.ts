import {
  DoofinderParameters,
  Zone,
  GenericObject,
  ClientOptions,
  ClientResponseOrError,
  ClientResponse,
  ClientError,
} from './types';

import { Query } from './querybuilder/query';
import { DoofinderResult } from './result';

import { buildQueryParamsString } from './util/encode-params';
import { isArray, isPlainObject } from './util/is';

interface DoofinderFullParameters extends DoofinderParameters {
  hashid: string;
  random?: number;
}

function isValidZone(zone: string): boolean {
  return Object.values(Zone).includes(zone as Zone);
}

/**
 * This class allows searching and sending stats using the Doofinder service.
 */
export class Client {
  public version = 5;
  public hashid: string;
  public secret: string;
  public zone: Zone;
  public endpoint: string;
  public headers: GenericObject<string>;

  /**
   * Constructor
   *
   * @param  {String} hashid  Unique ID of the Search Engine.
   * @param  {Object} options Options object.
   *
   *                          {
   *                            zone:    "eu1"            # Search Zone (eu1,
   *                                                      # us1, ...).
   *
   *                            apiKey:  "eu1-abcd..."    # Complete API key,
   *                                                      # including zone and
   *                                                      # secret key for auth.
   *
   *                            address: "localhost:4000" # Force server address
   *                                                      # for development
   *                                                      # purposes.
   *
   *                            version: "5"              # API version. Better
   *                                                      # not to touch this.
   *                                                      # For development
   *                                                      # purposes.
   *
   *                            headers: {                # You know, for HTTP.
   *                              "Origin": "...",
   *                              "...": "..."
   *                            }
   *                          }
   *
   *                          If you use `apiKey` you can omit `zone` but one of
   *                          them is required.
   *
   */
  public constructor({ zone, hashid, serverAddress, headers }: Partial<ClientOptions>);
  public constructor({ apiKey, hashid, serverAddress, headers }: Partial<ClientOptions>);
  public constructor({ apiKey, zone, hashid, serverAddress, headers }: Partial<ClientOptions> = {}) {
    if (apiKey) {
      const [z, k] = (apiKey || '').split('-');

      if (k && z && isValidZone(z)) {
        this.zone = z as Zone;
        this.secret = k;
      } else {
        throw new Error(`Invalid API key`);
      }
    } else if (zone) {
      if (isValidZone(zone)) {
        this.zone = zone;
      } else {
        throw new Error(`Invalid zone '${zone}'`);
      }
    } else {
      throw new Error(`Must configure API key or zone`);
    }

    this.endpoint = this.__buildEndpoint(serverAddress);

    this.hashid = hashid;
    this.headers = Object.assign({}, headers || {});

    if (this.secret) {
      this.headers['Authorization'] = this.secret;
    }
  }

  /**
   * Performs a HTTP request to the endpoint specified with the default
   * options of the client.
   *
   * @param  {String}   resource Resource to be called by GET.
   * @return {Promise<ClientResponseOrError>}
   */
  public async request(resource: string): Promise<ClientResponseOrError> {
    const response: Response = await fetch(`${this.endpoint}${resource}`, {
      method: 'GET',
      headers: Object.assign({}, this.headers),
    });

    if (response.ok) {
      return this.__buildResponse(response);
    } else {
      return this.__buildError(response);
    }
  }

  private async __buildResponse(response: Response): Promise<ClientResponse> {
    const data = await response.json();
    return { statusCode: response.status, data };
  }

  private async __buildError(response: Response): Promise<ClientError> {
    let data: object;

    try {
      data = await response.json();
    } catch (_error) {
      data = null;
    }

    return { statusCode: response.status, error: new Error(response.statusText), data };
  }

  //
  // Main Endpoints
  //

  /**
   * Performs a search request.
   *
   * @param  {String}   query    Search terms.
   * @param  {Object}   params   Parameters for the request. Optional.
   *
   *                             params =
   *                               page: Number
   *                               rpp: Number
   *                               type: String | [String]
   *                               filter:
   *                                 field: [String]
   *                                 field:
   *                                   from: Number
   *                                   to: Number
   *                               exclude:
   *                                 field: [String]
   *                                 field:
   *                                   from: Number
   *                                   to: Number
   *                               sort: String
   *                               sort:
   *                                 field: "asc" | "desc"
   *                               sort: [{field: "asc|desc"}]
   * @param  {Boolean}  wrapper  Tell the client to return a class object instead of
   *                             the raw value returned by the endpoint. Defaults to true
   *
   *
   * @return {Promise<ClientResponseOrError>}
   */
  public async search(
    query: string | Query,
    params?: DoofinderParameters,
    wrapper = true
  ): Promise<ClientResponseOrError | DoofinderResult> {
    const querystring: string = this.__buildSearchQueryString(query, params);
    const response: ClientResponseOrError = await this.request(`/${this.version}/search?${querystring}`);

    if (!wrapper) {
      return response;
    } else {
      if (response.statusCode >= 200 && response.statusCode <= 299) {
        return new DoofinderResult(response.data);
      } else {
        return response;
      }
    }
  }

  /**
   * Perform a request to get options for a search engine.
   *
   * @param  {String}   suffix   Optional suffix to add to the request URL. Can
   *                             be something like a domain, so the URL looks
   *                             like /<version>/options/<hashid>?example.com.
   * @param  {Function} callback Callback to be called when the response is
   *                             received. First param is the error, if any,
   *                             and the second one is the response, if any.
   * @return {Promise<ClientResponseOrError>}
   */
  public async options(suffix?: string): Promise<ClientResponseOrError> {
    suffix = suffix ? `?${suffix}` : '';
    return await this.request(`/${this.version}/options/${this.hashid}${suffix}`);
  }

  /**
   * Performs a request to submit stats events to Doofinder.
   *
   * @param  {String}   eventName Type of stats. Configures the endpoint.
   * @param  {Object}   params    Parameters for the query string.
   * @param  {Function} callback  Callback to be called when the response is
   *                              received. First param is the error, if any,
   *                              and the second one is the response, if any.
   * @return {Promise<ClientResponseOrError>}
   */
  public async stats(eventName = '', params?: DoofinderParameters): Promise<ClientResponseOrError> {
    const defaultParams: DoofinderFullParameters = {
      hashid: this.hashid,
      random: new Date().getTime(),
    };
    let querystring = buildQueryParamsString(Object.assign(defaultParams, params || {}));
    if (querystring != null) {
      querystring = `?${querystring}`;
    }
    return await this.request(`/${this.version}/stats/${eventName}${querystring}`);
  }

  /**
   * Creates a search query string for the specified query and parameters
   * intended to be used in the search API endpoint.
   *
   * NOTICE:
   *
   * - qs library encodes "(" and ")" as "%28" and "%29" although is not
   *   needed. Encoded parentheses must be supported in the search endpoint.
   * - Iterating objects doesn't ensure the order of the keys so they can't be
   *   reliabily used to specify sorting in multiple fields. That's why this
   *   method validates sorting and raises an exception if the value is not
   *   valid.
   *
   *   - sort: field                                         [OK]
   *   - sort: {field: 'asc|desc'}                           [OK]
   *   - sort: [{field1: 'asc|desc'}, {field2: 'asc|desc'}]  [OK]
   *   - sort: {field1: 'asc|desc', field2: 'asc|desc'}      [ERR]
   *
   * @param  {String | Object} query  Cleaned search terms.
   * @param  {Object}          params Search parameters object.
   *
   * @return {String}     Encoded query string to be used in a search URL.
   *
   */
  private __buildSearchQueryString(query?: string | Query, params?: DoofinderParameters): string {
    let q: Query = new Query();

    // We get a no query
    if (query == null) {
      q.search('');
      q.setParameters(params || {});
    } else if (typeof query === 'string') {
      // We get a string query
      // clean it up
      query = query.replace(/\s+/g, ' ');
      query = query === ' ' ? query : query.trim();

      q.search(query);
      q.setParameters(params || {});
    } else {
      q = query;
    }

    if (this.hashid && !q.hasParameter('hashid')) {
      q.setParameter('hashid', this.hashid);
    }

    const queryParams: DoofinderParameters = q.getParams();
    queryParams.query = q.getQuery();

    if (isArray(queryParams.type) && queryParams.type.length === 1) {
      queryParams.type = queryParams.type[0];
    }

    if (isPlainObject(queryParams.sort) && Object.keys(queryParams.sort).length > 1) {
      throw new Error('To sort by multiple fields use an Array of Objects');
    }

    return buildQueryParamsString(queryParams);
  }

  private __buildEndpoint(serverAddress: string): string {
    let [protocol, address] = (serverAddress || `${this.zone}-search.doofinder.com`).split('://');

    if (!address) {
      address = protocol;
      protocol = null;
    }

    return `${protocol || (this.secret ? 'https:' : '')}//${address}`;
  }
}
