import { Client } from './doofinder';
import { Zone } from './types';
/**
 * This class allows to retrieve a fully configured
 * Doofinder client and holds a pool of the previous
 * fetched clients.
 *
 * It is a singleton and a reference to the object
 * instance can be retrieved through the call to the
 * static method `getInstance()`
 *
 */
export declare class ClientRepo {
    private static instance;
    private pool;
    private _zone;
    private constructor();
    static getInstance(): ClientRepo;
    getClient(): Client;
    zone: Zone;
}
