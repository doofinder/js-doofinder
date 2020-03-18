import { Client, ClientOptions } from './client';
import { StatsClient } from './stats';

/**
 * Manage clients for multiple zones as singletons with shared settings.
 *
 * @remarks
 *
 * GOLDEN RULE: Don't save references to clients obtained from the pool,
 * always request new ones.
 *
 * @example
 *
 * ```ts
 * ClientPool.getClient('eu1');
 * ClientPool.getStatsClient('eu1');
 * ```
 *
 * @public
 */
export class ClientPool {
  private static _clientsPool: Map<string, Client> = new Map();
  private static _statsClientsPool: Map<string, StatsClient> = new Map();
  private static _options: Partial<ClientOptions> = {};

  private constructor() {
    throw new Error(`can't create instances of this class`);
  }

  /**
   * Property to change shared options.
   *
   * When changed, all existing clients are removed so new ones get the
   * new options.
   *
   * @public
   */
  public static get options(): Partial<ClientOptions> {
    return this._options;
  }
  public static set options(value: Partial<ClientOptions>) {
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
   * @returns An instance of `Client`.
   *
   * @public
   */
  public static getClient(zone: string): Client {
    if (!this._clientsPool.has(zone)) {
      this._clientsPool.set(zone, new Client({ ...this._options, zone }));
    }

    return this._clientsPool.get(zone);
  }

  /**
   * Get a stats client for the given zone with the shared options.
   *
   * @param zone - A valid search zone.
   * @returns An instance of `StatsClient`.
   *
   * @public
   */
  public static getStatsClient(zone: string): StatsClient {
    if (!this._statsClientsPool.has(zone)) {
      this._statsClientsPool.set(zone, new StatsClient(this.getClient(zone)));
    }

    return this._statsClientsPool.get(zone);
  }

  /**
   * Reset the shared options of the pool.
   * @public
   */
  public static reset() {
    this.options = {};
  }

  /**
   * Remove al existing clients from the pool.
   * @public
   */
  public static clear() {
    this._clientsPool.clear();
    this._statsClientsPool.clear();
  }
}
