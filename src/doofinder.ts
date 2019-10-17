// Doofinder types
export * from './types';
export * from './result';
export { Query } from './querybuilder/query';

export { ClientRepo } from './client-repo';

import {
  DoofinderClientOptions,
  DoofinderFilterRange,
  DoofinderFilter,
  DoofinderSorting,
  DoofinderSortOption,
  DoofinderParameters,
  DoofinderHeaders,
  DoofinderRequestOptions,
  GenericObject,
} from './types';

import { DoofinderResult } from './result';

// Expose the QueryBuilder interface too
import { Query } from './querybuilder/query';

import { HttpClient, HttpResponse } from './util/http';
import { isArray, isPlainObject, isNull } from './util/is';
import { buildQueryParamsString } from './util/encode-params';

interface DoofinderFullParameters extends DoofinderParameters {
  hashid: string;
  random?: number;
}

/**
 * This class allows searching and sending stats using the Doofinder service.
 */
export class Client {
  public apiVersion = '5';
  public hashid: string = null;
  private requestOptions: DoofinderRequestOptions;
  private httpClient: HttpClient = null;
  private version: string = null;

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
  public constructor(hashid?: string, options: DoofinderClientOptions = {}) {
    if (hashid) {
      this.hashid = hashid;
    }

    let zone,
      secret: string = null;

    if ('apiKey' in options) {
      [zone, secret] = options.apiKey.split('-');
      if (zone && !secret) {
        throw new Error('invalid `apiKey`');
      }
    } else if ('zone' in options) {
      zone = options['zone'];
    }

    if (!options['zone'] && !options['apiKey']) {
      throw new Error('`apiKey` or `zone` must be defined');
    }

    let [protocol, address] = (options.address || `${zone}-search.doofinder.com`).split('://');

    if (isNull(address)) {
      address = protocol;
      protocol = null;
    }

    const [host, port] = address.split(':');

    this.requestOptions = {
      host: host,
      port: port,
      // headers: options.headers || {}
      headers: (options.headers as DoofinderHeaders) || {},
    };

    if (!isNull(protocol)) {
      this.requestOptions.protocol = `${protocol}:`;
    }

    if (!isNull(secret)) {
      this.requestOptions.headers['Authorization'] = secret;
    }

    // This works even if no apiKey passed but passed an "Authorization" header
    if ('Authorization' in this.requestOptions.headers) {
      this.requestOptions.protocol = 'https:';
    }

    this.httpClient = new HttpClient();
    this.version = `${options.version || this.apiVersion}`;
  }

  /**
   * Performs a HTTP request to the endpoint specified with the default options
   * of the client.
   *
   * @param  {String}   resource Resource to be called by GET.
   * @return {Promise<HttpResponse>}
   */
  public async request(resource: string): Promise<HttpResponse> {
    return await this.httpClient.request(resource, this.requestOptions);
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
   * @return {Promise<HttpResponse>}
   */
  public async search(
    query: string | Query,
    params?: DoofinderParameters,
    wrapper = true
  ): Promise<HttpResponse | DoofinderResult> {
    const querystring: string = this._buildSearchQueryString(query, params);

    const response: HttpResponse = await this.request(`/${this.version}/search?${querystring}`);
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
   * @return {Promise<HttpResponse>}
   */
  public async options(suffix?: string): Promise<HttpResponse> {
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
   * @return {Promise<HttpResponse>}
   */
  public async stats(eventName = '', params?: DoofinderParameters): Promise<HttpResponse> {
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
  protected _buildSearchQueryString(query?: string | Query, params?: DoofinderParameters): string {
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
}
