import { Zone } from './types';
import { Client, ClientOptions } from './client';

/**
 * Manage clients for multiple zones as singletons with shared settings.
 *
 * @beta
 */
export class ClientPool {
  private _pool: Map<Zone, Client>;
  private _options: Partial<ClientOptions>;

  /**
   * Build a new pool.
   * @param options - Optional client options shared by all clients.
   */
  public constructor(options: Partial<ClientOptions> = {}) {
    this._pool = new Map();
    this.options = options;
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

    this._options = {
      serverAddress,
      headers: { ...headers },
    };

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
