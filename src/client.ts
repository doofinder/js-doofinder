import { Zone, GenericObject, StatsEvent } from './types';

import { Query, QueryParams } from './query';
import { DoofinderResult } from './result';

import { buildQueryString } from './util/encode-params';
import { isValidZone } from './util/is';
import { validateHashId } from './util/validators';

export interface ClientHeaders extends GenericObject<string> {
  Accept: string;
  Authorization: string;
}

/**
 * Options that can be used to create a Client instance.
 */
export interface ClientOptions {
  key: string;
  zone: Zone;
  serverAddress: string;
  headers: Partial<ClientHeaders>;
}

export class ClientError extends Error {}

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
  public secret: string;
  public zone: Zone;
  public endpoint: string;
  public headers: GenericObject<string>;

  /**
   * Constructor
   *
   * @param  {Object} options Options object.
   *
   *                          {
   *                            zone:    "eu1"            # Search Zone (eu1,
   *                                                      # us1, ...).
   *
   *                            key:  "eu1-abcd..."    # Complete API key,
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
   *                          If you use `key` you can omit `zone` but one of
   *                          them is required.
   *
   */
  public constructor({ key, zone, serverAddress, headers }: Partial<ClientOptions> = {}) {
    if (typeof key === 'string') {
      const [zone, secret] = key.split('-').map(x => x.trim());

      if (zone && secret) {
        this.zone = zone as Zone;
        this.secret = secret;
      } else if (zone) {
        this.secret = zone;
      }
    }

    if (typeof zone === 'string' && zone.trim()) {
      this.zone = zone.trim() as Zone;
    }

    if (!isValidZone(this.zone)) {
      throw new ClientError(`invalid zone '${this.zone}'`);
    }

    this.endpoint = this.__buildEndpoint(serverAddress);

    this.headers = {
      Accept: 'application/json',
      ...headers,
    };

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
   * @return {Promise<Response>}
   */
  public async search(params: Query | QueryParams): Promise<Response | DoofinderResult> {
    let request: Query;

    if (params instanceof Query) {
      request = params;
    } else {
      request = new Query(params);
    }

    const qs = buildQueryString({ random: new Date().getTime(), ...request.dump(true) });
    const response: Response = await this.request(this.buildUrl('/search', qs));
    return new DoofinderResult(await response.json());
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
  public async options(hashid: string, qs?: string): Promise<GenericObject> {
    validateHashId(hashid);
    const response = await this.request(this.buildUrl(`/options/${hashid}`, qs));
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
  // https://doofinder.github.io/js-doofinder/stats

  public async stats(eventName: StatsEvent, params?: GenericObject<string>): Promise<Response> {
    // TODO: validate params (hashid)
    const qs = buildQueryString({ random: new Date().getTime(), ...params });
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

  private __buildEndpoint(serverAddress: string): string {
    let [protocol, address] = (serverAddress || `${this.zone}-search.doofinder.com`).split('://');

    if (!address) {
      address = protocol;
      protocol = null;
    }

    return `${protocol || (this.secret ? 'https:' : '')}//${address}`;
  }
}
