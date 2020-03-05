import { Zone } from './types';
import { Client, ClientOptions } from './client';

export interface ClientPool {
  options: Partial<ClientOptions>;
  getClient(zone: Zone): Client;
}

/**
 * Manage clients for multiple zones as singletons with shared settings.
 *
 * @beta
 */
class ClientPoolSingleton implements ClientPool {
  private static _instance: ClientPoolSingleton;

  private _pool: Map<Zone, Client>;
  private _options: Partial<ClientOptions>;

  /**
   * Build a new pool.
   */
  private constructor() {
    this._pool = new Map();
    this.options = {};
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

    this._pool.clear();
  }

  /**
   * Get a client for the given zone with the shared options.
   *
   * @param zone - A valid search zone.
   * @beta
   */
  public getClient(zone: Zone): Client {
    if (!this._pool.has(zone)) {
      this._pool.set(zone, new Client({ ...this._options, zone }));
    }

    return this._pool.get(zone);
  }
}

export const pool: ClientPool = ClientPoolSingleton.getInstance();
