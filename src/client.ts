import { DoofinderParameters, Zone, GenericObject, StatsEvent } from './types';

import { Query } from './query';
import { DoofinderResult } from './result';

import { buildQueryString } from './util/encode-params';
import { isArray, isPlainObject, isValidZone } from './util/is';

export interface ClientHeaders extends GenericObject<string> {
  Accept: string;
  Authorization: string;
}

/**
 * Options that can be used to create a Client instance.
 */
export interface ClientOptions {
  apiKey: string;
  zone: Zone;
  hashid: string;
  serverAddress: string;
  headers: Partial<ClientHeaders>;
}

export class ClientResponseError extends Error {
  public statusCode: number;
  public response: Response;

  public constructor(response: Response) {
    super(response.statusText);
    this.name = 'ClientResponseError';
    this.statusCode = response.status;
    this.response = response;
  }
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
    this.headers = Object.assign(
      {
        Accept: 'application/json',
      },
      headers || {}
    );

    if (this.secret) {
      this.headers.Authorization = this.secret;
    }
  }

  /**
   * Performs a HTTP request to the endpoint specified with the default
   * options of the client.
   *
   * @param  {String}   resource Resource to be called by GET.
   * @return {Promise<Response>}
   */
  public async request(resource: string): Promise<Response> {
    const response = await fetch(resource, {
      method: 'GET',
      mode: 'cors',
      headers: Object.assign({}, this.headers),
    });

    if (response.ok) {
      return response;
    } else {
      throw new ClientResponseError(response);
    }
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
   * @return {Promise<Response>}
   */
  public async search(
    query: string | Query,
    params?: DoofinderParameters,
    wrap = true
  ): Promise<Response | DoofinderResult> {
    const qs: string = this.buildSearchQueryString(query, params);
    const response: Response = await this.request(this.buildUrl('/search', qs));
    const data = await response.json();
    return wrap ? new DoofinderResult(data) : data;
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
   * @return {Promise<Response>}
   */
  public async options(qs?: string): Promise<GenericObject> {
    const response = await this.request(this.buildUrl(`/options/${this.hashid}`, qs));
    return await response.json();
  }

  /**
   * Performs a request to submit stats events to Doofinder.
   *
   * @param  {String}   eventName Type of stats. Configures the endpoint.
   * @param  {Object}   params    Parameters for the query string.
   * @param  {Function} callback  Callback to be called when the response is
   *                              received. First param is the error, if any,
   *                              and the second one is the response, if any.
   * @return {Promise<Response>}
   */

  // ? Should this method accept StatsParameters or something like that?
  // ? Should be a StatsClient wrapping Client to perform specific stats calls or a StatsQuery object like Query to wrap and validate calls?
  // https://doofinder.github.io/js-doofinder/stats

  public async stats(eventName: StatsEvent, eventParams?: GenericObject<string>): Promise<GenericObject> {
    const params = Object.assign(
      {
        hashid: this.hashid,
        random: new Date().getTime(),
      },
      eventParams
    );
    const qs = buildQueryString(params);
    return await this.request(this.buildUrl(`/stats/${eventName}`, qs));
  }

  /**
   *
   * @param resource    URL part specifying the resource to be fetched from
   *                    the current version of the API. Should start by '/'.
   * @param querystring A query string to be attached to the URL. Should not
   *                    start by '?'.
   */
  public buildUrl(resource: string, querystring?: string): string {
    const qs = querystring ? `?${querystring}` : '';
    return `${this.endpoint}/${this.version}${resource}${qs}`;
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
  // TODO: All validation should be done in Query
  public buildSearchQueryString(query?: string | Query, params?: DoofinderParameters): string {
    let q: Query = new Query();

    // We get a no query
    if (query == null) {
      q.text = '';
      q.setParameters(params || {});
    } else if (typeof query === 'string') {
      // We get a string query
      // clean it up
      query = query.replace(/\s+/g, ' ');
      query = query === ' ' ? query : query.trim();

      q.text = query;
      q.setParameters(params || {});
    } else {
      q = query;
    }

    if (this.hashid && !q.hashid) {
      q.hashid = this.hashid;
    }

    const queryParams = q.dump();

    if (isArray(queryParams.type) && queryParams.type.length === 1) {
      queryParams.type = queryParams.type[0];
    }

    return buildQueryString(queryParams);
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
