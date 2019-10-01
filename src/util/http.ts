import { error, warning } from "./errors";
import { merge } from "./merge";
import { isString, isFunction } from './is';
import { GenericObject } from '../types';

/**
 * Commodity API to http and https modules
 */
export class HttpClient {
  /**
   * Performs a HTTP request expecting JSON to be returned.
   * @param  {Object}   options  Options needed by http.ClientRequest
   * @param  {Function} callback Callback to be called when the response is
   *                             received. First param is the error, if any,
   *                             and the second one is the response, if any.
   * @return {http.ClientRequest}
   */
  public async request(url: string, callback: Function, options?: GenericObject) {
    const response = await fetch(url, options);

    if (response.ok) {
      const data = await response.json();
      callback(undefined, data);
    } else {
      let error = {};
      try {
        const data = await response.json();
        callback({statusCode: response}, data);
      } catch(err) {
        error = {error: err};
        callback({statusCode: response.status}, error);
      }
    }
  }
}
