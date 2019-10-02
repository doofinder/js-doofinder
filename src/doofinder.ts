import { stringify } from 'qs';

import { error } from './util/errors';
import { GenericObject } from './types';
 
import { HttpClient } from './util/http';
import { isArray, isPlainObject, isNotNull } from './util/is';


export interface DoofinderClientOptions {
  zone?: string;
  apiKey?: string;
  address?: string;
  version?: string;
  headers?: object;
}

export interface DoofinderFilterRange {
  from: number;
  to: number;
}

export interface DoofinderFilter {
  field: string[] | DoofinderFilterRange;
}

export enum DoofinderSorting {
  ASC = 'asc',
  DESC = 'desc'
}

export interface DoofinderSortOption {
  [field: string]: DoofinderSorting
}

export interface DoofinderParameters {
   page?: number;
   rpp?: number;
   type?: string | string[];
   filter?: DoofinderFilter;
   exclude?: DoofinderFilter;
   sort?: String | DoofinderSortOption | DoofinderSortOption[];
}

/**
 * This class allows searching and sending stats using the Doofinder service.
 */
export class Client {
  public apiVersion: string = "5";
  public hashid: string = null;
  private requestOptions: GenericObject;
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
  constructor(hashid: string, options: DoofinderClientOptions = {}) {
    const [zone, secret] = (options.apiKey || options.zone || "").split("-");

    if (!zone) {
      let message: string = null;
      if (secret)
        message = "invalid `apiKey`";
      else
        message = "`apiKey` or `zone` must be defined";

      throw (error(message, this));
    }

    let [protocol, address] = (options.address || `${zone}-search.doofinder.com`).split("://");

    if (!isNotNull(address)) {
      address = protocol
      protocol = null
    }

    const [host, port] = address.split(":");

    this.requestOptions = {
      host: host,
      port: port,
      headers: options.headers || {}
    }

    if (isNotNull(protocol)) {
      this.requestOptions.protocol = `${protocol}:`;
    }

    if (isNotNull(secret)) {
      this.requestOptions.headers["Authorization"] = secret;
    }

    // This works even if no apiKey passed but passed an "Authorization" header
    if ("Authorization" in this.requestOptions.headers) {
      this.requestOptions.protocol = "https:";
    }

    this.httpClient = new HttpClient();
    this.version = `${options.version || this.apiVersion}`;
  }

  /**
   * Performs a HTTP request to the endpoint specified with the default options
   * of the client.
   *
   * @param  {String}   resource Resource to be called by GET.
   * @param  {Function} callback Callback to be called when the response is
   *                             received. First param is the error, if any,
   *                             and the second one is the response, if any.
   * @return {http.ClientRequest}
   */
  public request(resource: string, callback: Function) {
    this.httpClient.request(resource, callback, this.requestOptions);
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
   *
   * @param  {Function} callback Callback to be called when the response is
   *                             received. First param is the error, if any,
   *                             and the second one is the response, if any.
   * @return {http.ClientRequest}
   */
  public search(query: string, params?: Function): void;
  public search(query: string, params?: DoofinderParameters | Function, callback?: Function): void {
    let fnCallback: Function = null;
    if (typeof params === 'function') {
      fnCallback = params;
      params = {};
    } else {
      fnCallback = callback;
    }
    const querystring: string = this._buildSearchQueryString(query, params);
    this.request(`/${this.version}/search?${querystring}`, fnCallback);
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
   * @return {http.ClientRequest}
   */
  public options(suffix: Function): void;
  public options(suffix: string | Function, callback?: Function): void {
    if (typeof suffix === 'function') {
      callback = suffix;
      suffix = "";
    }

    suffix = suffix ? `?${suffix}` : "";
    this.request(`/${this.version}/options/${this.hashid}${suffix}`, callback);
  }

  /**
   * Performs a request to submit stats events to Doofinder.
   *
   * @param  {String}   eventName Type of stats. Configures the endpoint.
   * @param  {Object}   params    Parameters for the query string.
   * @param  {Function} callback  Callback to be called when the response is
   *                              received. First param is the error, if any,
   *                              and the second one is the response, if any.
   * @return {http.ClientRequest}
   */
  public stats(eventName: string, params?: GenericObject, callback?: Function): void {
    eventName = isNotNull(eventName) ? eventName : "";
    let defaultParams: GenericObject = {
      hashid: this.hashid,
      random: new Date().getTime()
    }
    let querystring = stringify(Object.assign(defaultParams, (params || {})));
    if (querystring != null) {
      querystring = `?${querystring}`;
    }
    this.request(`/${this.version}/stats/${eventName}${querystring}`, callback);
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
   * @param  {String} query  Cleaned search terms.
   * @param  {Object} params Search parameters object.
   * @return {String}        Encoded query string to be used in a search URL.
   */
  protected _buildSearchQueryString(query: string, params: DoofinderParameters): string {
    if (query == null) query = "";
    query = (query.replace(/\s+/g, " "));
    query = query === " " ? query : query.trim();

    let defaultParams: GenericObject = {
      hashid: this.hashid
    }

    let queryParams = Object.assign(defaultParams, (params || {}), {query: query});

    if ((isArray(queryParams.type)) && (queryParams.type.length === 1)) {
      queryParams.type = queryParams.type[0];
    }

    if ((isPlainObject(queryParams.sort)) &&
        ((Object.keys(queryParams.sort)).length > 1)) {
      throw (error("To sort by multiple fields use an Array of Objects", this));
    }

    // if we skip nulls, transformer won't ever be sent as empty!
    // so, if you don't want a param to be present, just don't add it or set
    // it as undefined
    return stringify(queryParams, {skipNulls: false});
  }
}
