import { stringify } from 'qs';
import { error } from './util/errors';
import { HttpClient } from './util/http';
import { isArray, isPlainObject, isNotNull } from './util/is';
export var DoofinderSorting;
(function (DoofinderSorting) {
    DoofinderSorting["ASC"] = "asc";
    DoofinderSorting["DESC"] = "desc";
})(DoofinderSorting || (DoofinderSorting = {}));
/**
 * This class allows searching and sending stats using the Doofinder service.
 */
export class Client {
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
    constructor(hashid, options = {}) {
        this.apiVersion = "5";
        this.hashid = null;
        this.httpClient = null;
        this.version = null;
        const [zone, secret] = (options.apiKey || options.zone || "").split("-");
        if (!zone) {
            let message = null;
            if (secret)
                message = "invalid `apiKey`";
            else
                message = "`apiKey` or `zone` must be defined";
            throw (error(message, this));
        }
        let [protocol, address] = (options.address || `${zone}-search.doofinder.com`).split("://");
        if (!isNotNull(address)) {
            address = protocol;
            protocol = null;
        }
        const [host, port] = address.split(":");
        this.requestOptions = {
            host: host,
            port: port,
            headers: options.headers || {}
        };
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
    request(resource, callback) {
        this.httpClient.request(resource, callback, this.requestOptions);
    }
    search(query, params, callback) {
        let fnCallback = null;
        if (typeof params === 'function') {
            fnCallback = params;
            params = {};
        }
        else {
            fnCallback = callback;
        }
        const querystring = this._buildSearchQueryString(query, params);
        this.request(`/${this.version}/search?${querystring}`, fnCallback);
    }
    options(suffix, callback) {
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
    stats(eventName, params, callback) {
        eventName = isNotNull(eventName) ? eventName : "";
        let defaultParams = {
            hashid: this.hashid,
            random: new Date().getTime()
        };
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
    _buildSearchQueryString(query, params) {
        if (query == null)
            query = "";
        query = (query.replace(/\s+/g, " "));
        query = query === " " ? query : query.trim();
        let defaultParams = {
            hashid: this.hashid
        };
        let queryParams = Object.assign(defaultParams, (params || {}), { query: query });
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
        return stringify(queryParams, { skipNulls: false });
    }
}
//# sourceMappingURL=doofinder.js.map