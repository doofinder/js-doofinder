import { GenericObject } from '../types';
export interface HttpResponse {
    statusCode: number;
    data?: GenericObject;
    error?: GenericObject;
}
/**
 * Commodity API to http and https modules
 */
export declare class HttpClient {
    /**
     * Performs a HTTP request expecting JSON to be returned.
     *
     * @param  {String}   url      The url to be fetched
     * @param  {Object}   options  Options needed by fetch API
     *
     * @return {Promise<HttpResponse>}
     */
    request(url: string, options?: GenericObject): Promise<HttpResponse>;
}
