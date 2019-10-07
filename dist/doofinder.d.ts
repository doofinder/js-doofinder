import { DoofinderClientOptions, DoofinderParameters } from './types';
import { HttpResponse } from './util/http';
/**
 * This class allows searching and sending stats using the Doofinder service.
 */
export declare class Client {
    apiVersion: string;
    hashid: string;
    private requestOptions;
    private httpClient;
    private version;
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
    constructor(hashid: string, options?: DoofinderClientOptions);
    /**
     * Performs a HTTP request to the endpoint specified with the default options
     * of the client.
     *
     * @param  {String}   resource Resource to be called by GET.
     *
     * @return {Promise<HttpResponse>}
     */
    request(resource: string): Promise<HttpResponse>;
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
     * @return {Promise<HttpResponse>}
     */
    search(query: string, params?: DoofinderParameters): Promise<HttpResponse>;
    /**
     * Perform a request to get options for a search engine.
     *
     * @param  {String}   suffix   Optional suffix to add to the request URL. Can
     *                             be something like a domain, so the URL looks
     *                             like /<version>/options/<hashid>?example.com.
     * @param  {Function} callback Callback to be called when the response is
     *                             received. First param is the error, if any,
     *                             and the second one is the response, if any.
     * @return {Promise<HttpResponse>}
     */
    options(suffix?: string): Promise<HttpResponse>;
    /**
     * Performs a request to submit stats events to Doofinder.
     *
     * @param  {String}   eventName Type of stats. Configures the endpoint.
     * @param  {Object}   params    Parameters for the query string.
     * @param  {Function} callback  Callback to be called when the response is
     *                              received. First param is the error, if any,
     *                              and the second one is the response, if any.
     * @return {Promise<HttpResponse>}
     */
    stats(eventName?: string, params?: DoofinderParameters): Promise<HttpResponse>;
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
    protected _buildSearchQueryString(query: string, params: DoofinderParameters): string;
}
