import { Zone, GenericObject } from './types';

import { Query, QueryParams } from './query';
import { DoofinderResult } from './result';

import { buildQueryString } from './util/encode-params';
import { isValidZone, isString } from './util/is';
import { validateHashId, validateRequired, ValidationError } from './util/validators';

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
  private _version = 5;
  private _secret: string;
  private _zone: Zone;
  private _serverAddress: string;
  private _endpoint: string;
  private _headers: GenericObject<string>;

  public get zone(): Zone {
    return this._zone;
  }
  public set zone(value: Zone) {
    if (typeof value !== undefined) {
      if (isValidZone(value)) {
        this._zone = value;
        this._updateEndpoint();
      } else {
        throw new ClientError(`invalid zone '${value}'`);
      }
    }
  }

  public get secret(): string {
    return this._secret;
  }
  public set secret(value: string) {
    if (value != null && !isString(value)) {
      throw new ValidationError(`invalid api key`);
    } else if (value == null) {
      this._secret = undefined;
    } else {
      const [zone, secret] = value.split('-').map(x => x.trim());

      if (zone && secret) {
        this.zone = zone as Zone;
        this._secret = secret;
      } else if (zone) {
        this._secret = zone;
      } else {
        throw new ValidationError(`invalid api key`);
      }
    }

    this._updateEndpoint();

    if (this._headers) {
      this._updateHeaders();
    }
  }

  public get serverAddress(): string {
    return this._serverAddress;
  }
  public set serverAddress(value: string) {
    this._serverAddress = value;
    this._updateEndpoint();
  }

  public get headers(): GenericObject<string> {
    return this._headers;
  }

  public set headers(value: GenericObject<string>) {
    this._headers = {
      Accept: 'application/json',
      ...value,
    };
    this._updateHeaders();
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
  public constructor({ key, zone, serverAddress, headers }: Partial<ClientOptions> = {}) {
    // order matters!
    this.zone = zone || Zone.EU1;
    this.secret = key;
    this.headers = headers || {};
    this.serverAddress = serverAddress;
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

  public async stats(eventName: string, params: GenericObject<string>): Promise<Response> {
    const { hashid, session_id } = params;
    validateRequired(session_id, 'session_id is required');
    validateHashId(hashid);
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
    return `${this._endpoint}/${this._version}${resource}${qs}`;
  }

  private _updateEndpoint(): void {
    // ! DON'T USE PUBLIC PROPERTIES HERE TO PREVENT INFINITE LOOPS!

    if (!this._serverAddress && !this._zone) {
      throw new ClientError(`missing api key or search zone`);
    }

    let [protocol, address] = (this._serverAddress || `${this._zone}-search.doofinder.com`).split('://');

    if (!address) {
      address = protocol;
      protocol = '';
    }

    if (this._secret) {
      protocol = 'https:';
    }

    this._endpoint = `${protocol}//${address}`;
  }

  private _updateHeaders(): void {
    if (this._secret) {
      this._headers.Authorization = this._secret;
    } else {
      delete this._headers.Authorization;
    }
  }

  public toString(): string {
    return `Client(${this.endpoint}${this.secret ? ' (+secret)' : ''})`;
  }
}
