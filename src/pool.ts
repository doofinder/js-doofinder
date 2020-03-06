import { Zone } from './types';
import { Client, ClientOptions } from './client';
import { StatsClient } from './stats';

/**
 * Manage clients for multiple zones as singletons with shared settings.
 *
 * @beta
 */
class ClientPoolSingleton {
  private static _instance: ClientPoolSingleton;

  private _clientsPool: Map<Zone, Client>;
  private _statsClientsPool: Map<Zone, StatsClient>;
  private _options: Partial<ClientOptions>;

  /**
   * Build a new pool.
   */
  private constructor() {
    this._clientsPool = new Map();
    this._statsClientsPool = new Map();
    this.reset();
  }

  public static getInstance(): ClientPoolSingleton {
    if (this._instance == null) {
      this._instance = new ClientPoolSingleton();
    }
    return this._instance;
  }

  /**
   * Property to change shared options.
   *
   * When changed, all existing clients are removed so new ones get the
   * new options.
   *
   * @beta
   */
  public get options(): Partial<ClientOptions> {
    return this._options;
  }
  public set options(value: Partial<ClientOptions>) {
    const { serverAddress, headers } = value;
    const options: Partial<ClientOptions> = {};

    if (serverAddress) {
      options.serverAddress = serverAddress;
    }

    if (headers) {
      options.headers = Object.freeze({ ...headers });
    }

    this._options = Object.freeze(options);

    this.clear();
  }

  /**
   * Get a client for the given zone with the shared options.
   *
   * @param zone - A valid search zone.
   * @beta
   */
  public getClient(zone: Zone): Client {
    if (!this._clientsPool.has(zone)) {
      this._clientsPool.set(zone, new Client({ ...this._options, zone }));
    }

    return this._clientsPool.get(zone);
  }

  public getStatsClient(zone: Zone): StatsClient {
    if (!this._statsClientsPool.has(zone)) {
      this._statsClientsPool.set(zone, new StatsClient(this.getClient(zone)));
    }

    return this._statsClientsPool.get(zone);
  }

  public reset() {
    this.options = {};
  }

  public clear() {
    this._clientsPool.clear();
    this._statsClientsPool.clear();
  }
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ClientPool extends ClientPoolSingleton {}
export const pool: ClientPool = ClientPoolSingleton.getInstance();
