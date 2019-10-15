import { Client } from './doofinder';
import { Zone } from './types';

interface ClientPool {
  [zoneKey: string]: Client;
}

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
export class ClientRepo {
  private static instance: ClientRepo;
  private pool: ClientPool = {};
  private _zone: Zone = Zone.EU;

  private constructor() {
    // Does nothing
  }

  public static getInstance(): ClientRepo {
    if (!this.instance) {
      this.instance = new ClientRepo();
    }

    return this.instance;
  }

  public getClient(): Client {
    if (!(this.zone in this.pool)) {
      this.pool[this.zone] = new Client(null, { zone: this.zone });
    }
    return this.pool[this.zone];
  }

  public set zone(zone: Zone) {
    // TODO: Let's do a check here, Typescript does not behave here
    this._zone = zone;
  }

  public get zone(): Zone {
    return this._zone;
  }
}