import { error, warning } from "./errors";
import { isString, isFunction } from './is';
import { GenericObject } from '../types';


export interface HttpResponse {
  statusCode: number;
  data?: GenericObject;
  error?: GenericObject;
}

/**
 * Commodity API to http and https modules
 */
export class HttpClient {
  /**
   * Performs a HTTP request expecting JSON to be returned.
   *
   * @param  {String}   url      The url to be fetched
   * @param  {Object}   options  Options needed by fetch API
   * 
   * @return {Promise<HttpResponse>}
   */
  public async request(url: string, options?: GenericObject): Promise<HttpResponse> {
    const response = await fetch(url, options);

    if (response.ok) {
      const data = await response.json();
      return {statusCode: 200, data}; 
    } else {
      let error = {};
      try {
        const data = await response.json();
        return {statusCode: response.status, data: data};
      } catch(err) {
        return {statusCode: response.status, error: err};
      }
    }
  }
}
