import { Client } from './client';
import { validateRequired, validateDoofinderId, ValidationError } from './util/validators';
import { clone } from './util/clone';
import { Method } from './enum/method';

/**
 * Basic parameters for stats requests.
 * @public
 */
export interface StatsParams {
  /** Unique ID of the user session. */
  session_id: string;
  /** Unique ID of the search engine. */
  hashid: string;
}

/**
 * Basic parameters for init session requests.
 * @public
 */
export interface InitParams extends StatsParams {
  /** Unique ID of the user. */
  user_id?: string;
}

/**
 * Basic parameters for checkout requests.
 * @public
 */
export interface CheckoutParams extends StatsParams {
  /** Unique ID of the user. */
  user_id?: string;
}

/**
 * Parameters for click stats with dfid.
 * @public
 */
export interface ClickStatsParamsWithDfid extends StatsParams {
  /** Optional ID of the custom results that produced the current set of results. */
  custom_results_id?: string | number;
  /** Unique ID of the clicked result. */
  dfid: string;
  /** Unique ID of the user session. */
  session_id: string;
  /** Unique ID of the user. */
  user_id?: string;
  /** Optional search terms. */
  query?: string;
}

/**
 * Parameters for image stats.
 * @public
 */
export interface ImageStatsParams extends StatsParams {
  /** Unique ID of the image in Doofinder. */
  id: string | number;
  query?: string;
}

/**
 * Parameters for redirection stats.
 * @public
 */
export interface RedirectionStatsParams extends StatsParams {
  /** Unique ID of the redirection in Doofinder. */
  id: string | number;
  /** Optional search terms. */
  query?: string;
}

/**
 * Parameters for the cart stats.
 * @public
 */
export interface CartItemStatsParams extends StatsParams {
  /** Unique ID of the clicked result. */
  id: string;
  /** Amount of the given item **/
  amount: number;
  /** Name of the indice the item belongs to. i.e. "product" **/
  index: string;
  /** Title of the given item **/
  title: string;
  /** Price of the given item **/
  price: number;
}

/**
 * Wrapper class to simplify stats calls.
 * @public
 */
export class StatsClient {
  private _client: Client;

  public constructor(client: Client) {
    if (client instanceof Client) {
      this._client = client;
    } else {
      throw new ValidationError(`expected an instance of Client`);
    }
  }

  public get client(): Client {
    return this._client;
  }

  /**
   * Registers a session ID in Doofinder.
   *
   * @param params - An options object. See {@link StatsParams}.
   * @returns A promise to be fullfilled with the response or rejected
   * with a `ClientResponseError`.
   *
   * @public
   */
  public async registerSession(params: InitParams): Promise<Response> {
    return this.client.stats('init', params as Record<string, any>, Method.PUT);
  }

  /**
   * Register a click on a result.
   *
   * @param params - An options object. See {@link ClickStatsParamsWithDfid}.
   * @returns A promise to be fullfilled with the response or rejected
   * with a `ClientResponseError`.
   *
   * @public
   */
  public async registerClick(params: ClickStatsParamsWithDfid): Promise<Response> {
    validateRequired([params.dfid, params.hashid, params.session_id], 'dfid, hashid and session_id are required');
    return this.client.stats('click', params as Record<string, any>, Method.PUT);
  }

  /**
   * Register a checkout within the session.
   *
   * @param params - An options object. See {@link StatsParams}.
   * @returns A promise to be fullfilled with the response or rejected
   * with a `ClientResponseError`.
   *
   * @public
   */
  public async registerCheckout(params: CheckoutParams): Promise<Response> {
    return this.client.stats('checkout', params as Record<string, any>, Method.PUT);
  }

  /**
   * Register an image click during the current session.
   *
   * @param params - An options object. See {@link ImageStatsParams}.
   * @returns A promise to be fullfilled with the response or rejected
   * with a `ClientResponseError`.
   *
   * @public
   */
  public async registerImageClick(params: ImageStatsParams): Promise<Response> {
    validateRequired(params.id, 'id is required');
    return this.client.stats('image', params as Record<string, any>, Method.PUT);
  }

  /**
   * Register a redirection occurred during the current session.
   *
   * @param params - An options object. See {@link RedirectionStatsParams}.
   * @returns A promise to be fullfilled with the response or rejected
   * with a `ClientResponseError`.
   *
   * @public
   */
  public async registerRedirection(params: RedirectionStatsParams): Promise<Response> {
    validateRequired([params.id], 'id is required');
    return this.client.stats('redirect', params as Record<string, any>, Method.PUT);
  }

  /**
   * Adds an amount of item to the cart in the current session.
   *
   * @remarks
   *
   * The cart will be automatically
   * stored in stats if there's any call to registerCheckout. If the item is already in the
   * cart, the amount is automatically added to the current amount.
   *
   * @param params - An options object. See {@link CartItemStatsParams}.
   * @returns A promise to be fullfilled with the response or rejected
   * with a `ClientResponseError`.
   *
   * @beta
   */
  public async addToCart(params: CartItemStatsParams): Promise<Response> {
    validateRequired(params, 'id, amount, index, price and title are required');
    return this.client.stats(`cart/${params.session_id}`, params as Record<string, any>, Method.PUT);
  }

  /**
   * Removes an amount of item to the cart in the current session.
   *
   * @remarks
   *
   * The cart will be automatically
   * stored in stats if there's any call to registerCheckout. If any of the items' amount drops
   * to zero or below, it is automatically removed from the cart
   *
   * @param params - An options object. See {@link CartItemStatsParams}.
   * @returns A promise to be fullfilled with the response or rejected
   * with a `ClientResponseError`.
   *
   * @beta
   */
  public async removeFromCart(params: CartItemStatsParams): Promise<Response> {
    validateRequired([params.id, params.amount, params.index], 'id, amount and index are required');
    return this.client.stats(`cart/${params.session_id}`, params as Record<string, any>, Method.PATCH);
  }

  /**
   * Clears the cart in the current session.
   *
   * @param params - An options object. See {@link StatsParams}.
   * @returns A promise to be fullfilled with the response or rejected
   * with a `ClientResponseError`.
   *
   * @beta
   */
  public async clearCart(params: StatsParams): Promise<Response> {
    return this.client.stats(`cart/${params.session_id}`, params as Record<string, any>, Method.DELETE);
  }

  /**
   * Pass-through to register any custom event.
   *
   * @param eventName - The event name to register.
   * @param params - The params object associated to the event call.
   * It should have at least a session_id and a hashid.
   * @returns A promise to be fullfilled with the response or rejected
   * with a `ClientResponseError`.
   *
   * @public
   */
  public async registerEvent(eventName: string, params: Record<string, any>): Promise<Response> {
    return this.client.stats(eventName, params);
  }
}
