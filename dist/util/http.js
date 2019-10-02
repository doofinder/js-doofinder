var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
/**
 * Commodity API to http and https modules
 */
export class HttpClient {
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
    request(url, callback, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield fetch(url, options);
            if (response.ok) {
                const data = yield response.json();
                callback(undefined, data);
            }
            else {
                let error = {};
                try {
                    const data = yield response.json();
                    callback({ statusCode: response }, data);
                }
                catch (err) {
                    error = { error: err };
                    callback({ statusCode: response.status }, error);
                }
            }
        });
    }
}
//# sourceMappingURL=http.js.map