import { GenericObject } from './types';

import { Query, SearchParams } from './query';
import { processResponse, SearchResponse, RawSearchResponse } from './response';

import { buildQueryString } from './util/encode-params';
import { validateHashId, validateRequired, ValidationError } from './util/validators';

/**
 * Options that can be used to create a Client instance.
 * @public
 */
export interface ClientOptions {
  /**
   * Search zone: eu1, us1, …
   * @public
   */
  zone: string;
  /**
   * Secret token. May include or not the search zone.
   */
  secret: string;
  /**
   * Address of the search server to use. Optional. Use it to override the default search server.
   */
  serverAddress: string;
  /**
   * Additional HTTP headers to send, if any.
   */
  headers: GenericObject<string>;
}

/**
 * Represents an error response for a failed HTTP response from Doofinder.
 * @public
 */
export class ClientResponseError extends Error {
  /**
   * Status code of the HTTP response.
   * @public
   */
  public statusCode: number;
  /**
   * The Response received by the client.
   * @public
   */
  public response: Response;

  /**
   * The constructor for the response error.
   * @param response - An HTTP response from the fetch API.
   * @public
   */
  public constructor(response: Response) {
    super(response.statusText);
    this.name = 'ClientResponseError';
    this.statusCode = response.status;
    this.response = response;
  }
}

/**
 * Types of top stats.
 * @public
 */
export type TopStatsType = 'searches' | 'clicks';

/**
 * Parameters for a top stats request.
 * @public
 */
export interface TopStatsParams {
  /** Unique Id of the search engine. */
  hashid: string;
  /** Optional. Number of days to retrieve. */
  days?: number | string;
  /** Optional. */
  withresult?: boolean | string;
}

const API_KEY_RE = /^(([^-]+)-)?([a-f0-9]{40})$/i;

/**
 * Class that allows interacting with the Doofinder service.
 * @public
 */
export class Client {
  private _version = 5;
  private _zone: string;
  private _secret: string;
  private _endpoint: string;
  private _headers: GenericObject<string>;

  /**
   * Returns the search zone for this client.
   * @public
   */
  public get zone(): string {
    return this._zone;
  }

  /**
   * Returns the secret token for this client, if any.
   * @public
   */
  public get secret(): string {
    return this._secret;
  }

  /**
   * Returns the headers set for this client.
   * @public
   */
  public get headers(): GenericObject<string> {
    return this._headers;
  }

  /**
   * Returns the configured endpoint for this client.
   * @public
   */
  public get endpoint(): string {
    return this._endpoint;
  }

  /**
   * Constructor.
   *
   * @remarks
   *
   * At least a search zone is required. If none provided via the `zone`
   * or the `secret` options, the default `'eu1'` will be used.
   *
   * Provide a custom `serverAddress` options to override the default
   * endpoint for development purposes.
   *
   * @param options - options to instantiate the client.
   */
  public constructor({ zone, secret, headers, serverAddress }: Partial<ClientOptions> = {}) {
    const matches = API_KEY_RE.exec(secret);
    if (matches) {
      this._zone = matches[2] || zone || 'eu1';
      this._secret = matches[3];
    } else if (secret) {
      throw new ValidationError(`invalid api key`);
    } else {
      this._zone = zone || 'eu1';
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
   * Perform a request to a HTTP resource.
   *
   * @remarks
   *
   * If a payload is provided the request will be done via `POST` instead
   * of `GET`.
   *
   * @param resource - URL of the resource to request.
   * @param payload - An object to send via POST. Optional.
   * @returns A promise to be fullfilled with the response or rejected
   * with a `ClientResponseError`.
   *
   * @public
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
   * Perform a search in Doofinder based on the provided parameters.
   *
   * @param params - An instance of `Query` or an object with valid
   * search parameters.
   * @returns A promise to be fullfilled with the response or rejected
   * with a `ClientResponseError`.
   *
   * @public
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
   * Perform a suggestion query in Doofinder based on the provided parameters.
   *
   * @param params - An instance of `Query` or an object with valid
   * search parameters.
   * @returns A promise to be fullfilled with the response or rejected
   * with a `ClientResponseError`.
   *
   * @public
   */
  public async suggest(params: Query | SearchParams): Promise<SearchResponse> {
    let request: Query;

    if (params instanceof Query) {
      request = params;
    } else {
      request = new Query(params);
    }

    const qs = buildQueryString({ random: new Date().getTime(), hashid: request.hashid, query: request.text });
    const response: Response = await this.request(this.buildUrl('/suggest', qs), null);
    return processResponse((await response.json()) as RawSearchResponse);
  }

  /**
   * Perform a request to get the options of a search engine.
   *
   * @param hashid - A valid hashid for a search engine.
   * @returns A promise to be fullfilled with the response or rejected
   * with a `ClientResponseError`.
   *
   * @public
   */
  public async options(hashid: string): Promise<GenericObject> {
    validateHashId(hashid);
    const qs = buildQueryString({ random: new Date().getTime() });
    const response = await this.request(this.buildUrl(`/options/${hashid}`, qs));
    return await response.json();
  }

  /**
   * Perform a request to submit stats events to Doofinder.
   *
   * @param eventName - Type of stats to send.
   * @param params - Parameters for the query string.
   * @returns A promise to be fullfilled with the response or rejected
   * with a `ClientResponseError`.
   *
   * @public
   */
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
   * Build a URL for the provided resource.
   *
   * @param resource - URL part specifying the resource to be fetched
   * from the current version of the API. Should start by '/'.
   * @param querystring - A query string to be attached to the URL.
   * Should not start by '?'.
   * @returns A valid URL.
   *
   * @public
   */
  public buildUrl(resource: string, querystring?: string): string {
    const qs = querystring ? `?${querystring}` : '';
    return `${this._endpoint}/${this._version}${resource}${qs}`;
  }

  /**
   * Return a string representation of this class.
   * @returns A string.
   * @public
   */
  public toString(): string {
    return `Client(${this.endpoint}${this._secret ? ' (+secret)' : ''})`;
  }
}
