import { Client } from './doofinder';
import { Zone } from './types';
/**
 * This class allows to retrieve a fully configured
 * Doofinder client
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
export declare const clientRepo: ClientRepo;
