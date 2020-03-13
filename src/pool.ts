import { Client, ClientOptions, Zone } from './client';
import { StatsClient } from './stats';

/*
  GOLDEN RULE: Do not save references to clients obtained from the pool,
  always request new ones.
*/

/**
 * Manage clients for multiple zones as singletons with shared settings.
 *
 * @beta
 */
export class ClientPool {
  private static _clientsPool: Map<Zone, Client> = new Map();
  private static _statsClientsPool: Map<Zone, StatsClient> = new Map();
  private static _options: Partial<ClientOptions> = {};

  /**
   * Build a new pool.
   */
  private constructor() {
    throw new Error(`can't create instances of this class`);
  }

  /**
   * Property to change shared options.
   *
   * When changed, all existing clients are removed so new ones get the
   * new options.
   *
   * @beta
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
   * @beta
   */
  public static getClient(zone: Zone): Client {
    if (!this._clientsPool.has(zone)) {
      this._clientsPool.set(zone, new Client({ ...this._options, zone }));
    }

    return this._clientsPool.get(zone);
  }

  public static getStatsClient(zone: Zone): StatsClient {
    if (!this._statsClientsPool.has(zone)) {
      this._statsClientsPool.set(zone, new StatsClient(this.getClient(zone)));
    }

    return this._statsClientsPool.get(zone);
  }

  public static reset() {
    this.options = {};
  }

  public static clear() {
    this._clientsPool.clear();
    this._statsClientsPool.clear();
  }
}
