import { Client } from './doofinder';
export declare enum Zone {
    EU = "eu1",
    US = "us1"
}
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
