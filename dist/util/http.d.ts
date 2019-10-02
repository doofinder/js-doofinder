import { GenericObject } from '../types';
/**
 * Commodity API to http and https modules
 */
export declare class HttpClient {
    /**
     * Performs a HTTP request expecting JSON to be returned.
     *
     * @param  {String}   url      The url to be fetched
     * @param  {Function} callback Callback to be called when the response is
     *                             received. First param is the error, if any,
     *                             and the second one is the response, if any.
     * @param  {Object}   options  Options needed by fetch API
     * @return {Promise}
     */
    request(url: string, callback: Function, options?: GenericObject): Promise<void>;
}
