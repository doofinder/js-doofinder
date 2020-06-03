import { Client, ClientOptions } from './client';
import { StatsClient } from './stats';

/**
 * Manage clients for multiple servers as singletons with shared settings.
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
    const { server, headers } = value;
    const options: Partial<ClientOptions> = {};

    if (server) {
      options.server = server;
    }

    if (headers) {
      options.headers = Object.freeze({ ...headers });
    }

    this._options = Object.freeze(options);

    this.clear();
  }

  /**
   * Get a client for the given server with the shared options.
   *
   * @param server - A valid search server.
   * @returns An instance of `Client`.
   *
   * @public
   */
  public static getClient(server: string): Client {
    if (!this._clientsPool.has(server)) {
      this._clientsPool.set(server, new Client({ ...this._options, server }));
    }

    return this._clientsPool.get(server);
  }

  /**
   * Get a stats client for the given server with the shared options.
   *
   * @param server - A valid search server.
   * @returns An instance of `StatsClient`.
   *
   * @public
   */
  public static getStatsClient(server: string): StatsClient {
    if (!this._statsClientsPool.has(server)) {
      this._statsClientsPool.set(server, new StatsClient(this.getClient(server)));
    }

    return this._statsClientsPool.get(server);
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
