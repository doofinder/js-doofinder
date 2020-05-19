import { stringify, parse } from 'qs';

/**
 * Encode parameters for use in a querystring.
 *
 * @remarks
 *
 * This is a wrapper of `qs.stringify` from the `qs` library.
 *
 * See the {@link https://www.npmjs.com/package/qs | qs} package for more info.
 *
 * @param params - A plain object with request parameters
 * @param options - Options to serialize the parameters.
 *
 * @returns A valid querystring.
 * @public
 */
export const encode = stringify;

/**
 * Parse a querystring into a parameters object.
 *
 * @remarks
 *
 * This is a wrapper of `qs.parse` from the `qs` library.
 *
 * See the {@link https://www.npmjs.com/package/qs | qs} package for more info.
 *
 * @param querystring - The querystring from a URL.
 * @param options - Options to parse the querystring.
 *
 * @returns A parameters object.
 * @public
 */
export const decode = parse;
