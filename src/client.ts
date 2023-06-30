import { Method } from './enum/method';
import { Query, SearchParams, SearchImageParams } from './query';
import { _processSearchResponse, SearchResponse, RawSearchResponse } from './response';

import { encode } from './util/encode-params';
import { validateHashId, validateRequired, ValidationError } from './util/validators';

const absoluteUrlRX = new RegExp('^([a-z]+:)//', 'i');

/**
 * Version of the search API being used.
 * @public
 */
export const __API_VERSION__ = 6;

/**
 * Options that can be used to create a Client instance.
 * @public
 */
export interface ClientOptions {
  /**
   * Search server: eu1-search.doofinder.com, us1-search.doofinder.com
   * @public
   */
  server: string;
  /**
   * Secret token. May include or not the search server.
   */
  secret: string;
  /**
   * Additional HTTP headers to send, if any.
   */
  headers: Record<string, string>;
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

/**
 * Class that allows interacting with the Doofinder service.
 * @public
 */
export class Client {
  private _server: string;
  private _secret: string;
  private _endpoint: string;
  private _headers: Record<string, string>;

  /**
   * Returns the search server for this client.
   * @public
   */
  public get server(): string {
    return this._server;
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
  public get headers(): Record<string, string> {
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
   * At least a search server is required. If none provided via the `server`
   * or the `secret` options, the default `'eu1-search.doofinder.com'` will be used.
   *
   * @param options - options to instantiate the client.
   */
  public constructor({ server, secret, headers }: Partial<ClientOptions> = {}) {
    if (server == null) {
      throw new ValidationError(`search server is required`);
    }

    let protocol = '';
    const httpHeaders: Record<string, string> = { ...(headers || {}) };

    if (absoluteUrlRX.test(server)) {
      protocol = absoluteUrlRX.exec(server)[1]; // "http(s):"
    }

    if (secret != null) {
      this._secret = secret.trim();

      httpHeaders['Authorization'] = `Token ${this._secret}`;
      protocol = 'https:';
    }

    this._headers = {
      Accept: 'application/json',
      ...httpHeaders,
    };

    this._server = server;
    this._endpoint = `${protocol}//${server.replace(`${protocol}//`, '')}`;
  }

  /**
   * Perform a request to a HTTP resource.
   *
   * @remarks
   *
   * If a payload is provided the request will be done via `POST` instead
   * of `GET`.
   *
   * @param resource - The resource to request.
   * @param params - An object with the parameters to serialize in the
   * URL querystring. Optional.
   * @param payload - An object to send. Optional.
   * @param method - The method, by default will be GET. Optional.
   * @returns A promise to be fullfilled with the response or rejected
   * with a `ClientResponseError`.
   *
   * @public
   */
  public async request(
    resource: string,
    params: Record<string, any> = {},
    payload?: Record<string, any>,
    method = Method.GET
  ): Promise<Response> {
    const qs: string = encode({ random: new Date().getTime(), ...params });
    const url: string = this._buildUrl(resource, qs, params.hashid);
    const headers: Record<string, string> = payload ? { 'Content-Type': 'application/json' } : {};
    const body: string = payload ? JSON.stringify(payload) : undefined;
    const response = await fetch(url, {
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
   * @param query - An instance of `Query` or an object with valid
   * search parameters.
   * @returns A promise to be fullfilled with the response or rejected
   * with a `ClientResponseError`.
   *
   * @public
   */
  public async search(query: Query | SearchParams): Promise<SearchResponse> {
    const params: Record<string, any> = this._buildSearchQueryObject(query).dump(true);
    let payload: Record<string, any>;

    if (params.items != null) {
      payload = { items: params.items };
      delete params.items;
    }

    const response: Response = await this.request('/_search', params, payload);
    return _processSearchResponse((await response.json()) as RawSearchResponse);
  }

  /**
   * Perform a search in Doofinder based on the provided parameters.
   *
   * @param query - An instance of `Query` or an object with valid
   * search parameters.
   * @param image - string image in base 64.
   * @returns A promise to be fullfilled with the response or rejected
   * with a `ClientResponseError`.
   *
   * @public
   */
  public async searchImage(query: Query | SearchImageParams, image: string): Promise<SearchResponse> {
    const params: Record<string, any> = this._buildSearchQueryObject(query).dump(true);
    const payload: Record<string, any> = { image };

    const response: Response = await this.request('/_image_search', params, payload, Method.POST);
    return _processSearchResponse((await response.json()) as RawSearchResponse);
  }

  /**
   * Perform a suggestion query in Doofinder based on the provided parameters.
   *
   * @param query - An instance of `Query` or an object with valid
   * search parameters.
   * @returns A promise to be fullfilled with the response or rejected
   * with a `ClientResponseError`.
   *
   * @public
   */
  public async suggest(query: Query | SearchParams): Promise<SearchResponse> {
    const params: Record<string, any> = this._buildSearchQueryObject(query).dump(true);
    const response: Response = await this.request('/_suggest', params);
    return _processSearchResponse((await response.json()) as RawSearchResponse);
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
  public async stats(eventName: string, params: Record<string, string>, method = Method.GET): Promise<Response> {
    validateRequired(params.session_id, 'session_id is required');
    validateHashId(params.hashid);
    return await this.request(`/stats/${eventName}`, params, null, method);
  }

  public async topStats(type: TopStatsType, params: TopStatsParams): Promise<Response> {
    validateHashId(params.hashid);
    return await this.request(`/topstats/${type}`, params);
  }

  /**
   * Build a URL for the provided resource.
   *
   * @param resource - URL part specifying the resource to be fetched
   * from the current version of the API. Should start by '/'.
   * @param querystring - A query string to be attached to the URL.
   * Must not start by '?' nor '&'.
   * @returns A valid URL.
   */
  private _buildUrl(resource: string, querystring: string, hashid: string): string {
    const [prefix, qs]: string[] = resource.split('?');
    let suffix: string;

    if (qs != null) {
      suffix = `?${qs}${querystring ? `&${querystring}` : ''}`;
    } else {
      suffix = querystring ? `?${querystring}` : '';
    }

    return `${this.endpoint}/${__API_VERSION__}/${hashid}${prefix}${suffix}`;
  }

  /**
   * Return a string representation of this class.
   * @returns A string.
   * @public
   */
  public toString(): string {
    return `Client(${this.endpoint}${this._secret ? ' (+secret)' : ''})`;
  }

  /**
   * Normalize search params to a Query object.
   *
   * @param params - An instance of `Query` or an object with valid
   * search parameters.
   * @returns An instance of `Query`.
   */
  private _buildSearchQueryObject(params: Query | SearchParams): Query {
    if (params instanceof Query) {
      return params;
    } else {
      return new Query(params);
    }
  }
}
