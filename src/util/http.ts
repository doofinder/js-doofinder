// import fetch from 'cross-fetch';
// import 'cross-fetch/polyfill';
import { GenericObject } from '../types';

export interface HttpResponse {
  statusCode: number;
  data?: GenericObject;
  error?: GenericObject;
}

/**
 * Commodity API to wrap making the requests
 * to an endpoint.
 *
 */
export class HttpClient {
  /**
   * Performs a HTTP request expecting JSON to be returned.
   *
   * @param  {String}   url      The url to be fetched
   * @param  {Object}   options  Options needed by fetch API
   *
   * @return {Promise<HttpResponse>}
   *
   */
  public async request(url: string, options?: GenericObject): Promise<HttpResponse> {
    if (url.indexOf('http') === -1 && (options && options['host'])) {
      const protocol = options['protocol'] || 'http:';
      const port = options['port'] || '';
      url = `${protocol}//${options['host']}${port}${url}`;
    }

    const response = await fetch(url, options);

    if (response.ok) {
      const data = await response.json();
      return { statusCode: 200, data: data };
    } else {
      try {
        const data = await response.json();
        return { statusCode: response.status, data: data };
      } catch (err) {
        return { statusCode: response.status, error: err };
      }
    }
  }
}
