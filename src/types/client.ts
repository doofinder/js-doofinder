import { Zone, GenericObject } from './base';

export type RequestHeaders = GenericObject<string>;

/**
 * The type definition of the options that
 * can be sent to the Doofinder Client
 *
 */
export interface ClientOptions {
  apiKey: string;
  zone: Zone;
  hashid: string;
  serverAddress: string;
  headers: RequestHeaders;
}
