import { GenericObject } from './types';

import { Query, SearchParams } from './query';
import { processResponse, SearchResponse, RawSearchResponse } from './response';

import { buildQueryString } from './util/encode-params';
import { validateHashId, validateRequired, ValidationError } from './util/validators';

/**
 * The zones the client can be from
 */
export enum Zone {
  EU1 = 'eu1',
  US1 = 'us1',
}

export interface ClientHeaders extends GenericObject<string> {
  Accept: string;
  Authorization: string;
}

/**
 * Options that can be used to create a Client instance.
 */
export interface ClientOptions {
  zone: Zone;
  secret: string;
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

export type TopStatsType = 'searches' | 'clicks';
export interface TopStatsParams {
  hashid: string;
  days?: number | string;
  withresult?: boolean | string;
}

const API_KEY_RE = /^(([^-]+)-)?([a-f0-9]{40})$/i;

/**
 * This class allows searching and sending stats using the Doofinder service.
 */
export class Client {
  private _version = 5;
  private _zone: string;
  private _secret: string;
  private _endpoint: string;
  private _headers: GenericObject<string>;

  public get zone(): string {
    return this._zone;
  }

  public get secret(): string {
    return this._secret;
  }

  public get headers(): GenericObject<string> {
    return this._headers;
  }

  public get endpoint(): string {
    return this._endpoint;
  }

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
  public constructor({ zone, secret, headers, serverAddress }: Partial<ClientOptions> = {}) {
    const matches = API_KEY_RE.exec(secret);
    if (matches) {
      this._zone = matches[2] || zone || Zone.EU1;
      this._secret = matches[3];
    } else if (secret) {
      throw new ValidationError(`invalid api key`);
    } else {
      this._zone = zone || Zone.EU1;
    }

    let [protocol, address] = (serverAddress || `${this._zone}-search.doofinder.com`).split('://');

    if (!address) {
      address = protocol;
      protocol = '';
    }

    if (this._secret) {
      protocol = 'https:';
    }

    this._endpoint = `${protocol}//${address}`;

    this._headers = {
      Accept: 'application/json',
      ...(headers || {}),
      ...(this._secret ? { Authorization: this._secret } : {}),
    };
  }

  /**
   * Performs a HTTP request to the endpoint specified with the default
   * options of the client.
   *
   * @param  {String}   resource Resource to be called by GET.
   * @return {Promise<Response>}
   */
  public async request(resource: string, payload?: GenericObject): Promise<Response> {
    const method: string = payload ? 'POST' : 'GET';
    const headers: GenericObject<string> = payload ? { 'Content-Type': 'application/json' } : {};
    const body: string = payload ? JSON.stringify(payload) : undefined;
    const response = await fetch(resource, {
      mode: 'cors',
      headers: { ...this.headers, ...headers },
      method,
      body,
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
  public async search(params: Query | SearchParams): Promise<SearchResponse> {
    let request: Query;
    let payload: GenericObject;

    if (params instanceof Query) {
      request = params;
    } else {
      request = new Query(params);
    }

    const data: GenericObject = request.dump(true);

    if (data.items != null) {
      payload = { items: data.items };
      delete data.items;
    }

    const qs = buildQueryString({ random: new Date().getTime(), ...data });
    const response: Response = await this.request(this.buildUrl('/search', qs), payload);
    return processResponse((await response.json()) as RawSearchResponse);
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
  public async options(hashid: string): Promise<GenericObject> {
    validateHashId(hashid);
    const qs = buildQueryString({ random: new Date().getTime() });
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

  public async stats(eventName: string, params: GenericObject<string>): Promise<Response> {
    validateRequired(params.session_id, 'session_id is required');
    validateHashId(params.hashid);
    const qs = buildQueryString({ random: new Date().getTime(), ...params });
    return await this.request(this.buildUrl(`/stats/${eventName}`, qs));
  }

  public async topStats(type: TopStatsType, params: TopStatsParams): Promise<Response> {
    validateHashId(params.hashid);
    const qs = buildQueryString({ random: new Date().getTime(), ...params });
    return await this.request(this.buildUrl(`/topstats/${type}`, qs));
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
    return `${this._endpoint}/${this._version}${resource}${qs}`;
  }

  public toString(): string {
    return `Client(${this.endpoint}${this._headers.Authorization ? ' (+secret)' : ''})`;
  }
}
