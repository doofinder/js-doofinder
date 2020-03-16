import { GenericObject } from './types';

import { Client } from './client';
import { validateRequired, validateDoofinderId, ValidationError } from './util/validators';
import { clone } from './util/clone';

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
 * Parameters for click stats with dfid.
 * @public
 */
export interface ClickStatsParamsWithDfid extends StatsParams {
  /** Unique ID of the clicked result. */
  dfid: string;
  /** Optional search terms. */
  query?: string;
  /** Optional ID of the custom results that produced the current set of results. */
  custom_results_id?: string | number;
}

/**
 * Parameters for click stats without dfid.
 * @public
 */
export interface ClickStatsParamsWithId extends StatsParams {
  /** Unique ID of the clicked result as provided in the data source. */
  id: string | number;
  /** Data type of the clicked result. */
  datatype: string;
  /** Optional search terms. */
  query?: string;
  /** Optional ID of the custom results that produced the current set of results. */
  custom_results_id?: string | number;
}

/**
 * Parameters for image stats.
 * @public
 */
export interface ImageStatsParams extends StatsParams {
  /** Unique ID of the image in Doofinder. */
  img_id: string | number;
}

/**
 * Parameters for redirection stats.
 * @public
 */
export interface RedirectionStatsParams extends StatsParams {
  /** Unique ID of the redirection in Doofinder. */
  redirection_id: string | number;
  /** The target of the redirection. */
  link: string;
  /** Optional search terms. */
  query?: string;
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
  public async registerSession(params: StatsParams): Promise<Response> {
    return this.client.stats('init', params as GenericObject);
  }

  /**
   * Register a click on a result.
   *
   * @param params - An options object. See {@link ClickStatsParamsWithDfid} and {@link ClickStatsParamsWithId}.
   * @returns A promise to be fullfilled with the response or rejected
   * with a `ClientResponseError`.
   *
   * @public
   */
  public async registerClick(params: ClickStatsParamsWithDfid | ClickStatsParamsWithId): Promise<Response> {
    const options = clone(params);
    if ('dfid' in options) {
      validateDoofinderId(options.dfid);
      /* eslint-disable @typescript-eslint/ban-ts-ignore */
      // @ts-ignore
      delete options.id;
      // @ts-ignore
      delete options.datatype;
      /* eslint-enable @typescript-eslint/ban-ts-ignore */
    } else {
      validateRequired([options.id, options.datatype], 'dfid or id + datatype are required');
      /* eslint-disable @typescript-eslint/ban-ts-ignore */
      // @ts-ignore
      delete options.dfid;
      /* eslint-enable @typescript-eslint/ban-ts-ignore */
    }
    return this.client.stats('click', options as GenericObject);
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
  public async registerCheckout(params: StatsParams): Promise<Response> {
    return this.client.stats('checkout', params as GenericObject);
  }

  /**
   * Register an image display during the current session.
   *
   * @param params - An options object. See {@link ImageStatsParams}.
   * @returns A promise to be fullfilled with the response or rejected
   * with a `ClientResponseError`.
   *
   * @public
   */
  public async registerImageDisplay(params: ImageStatsParams): Promise<Response> {
    validateRequired(params.img_id, 'img_id is required');
    return this.client.stats('img_display', params as GenericObject);
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
    validateRequired(params.img_id, 'img_id is required');
    return this.client.stats('img_click', params as GenericObject);
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
    validateRequired([params.redirection_id, params.link], 'redirection_id and link are required');
    return this.client.stats('redirect', params as GenericObject);
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
  public async registerEvent(eventName: string, params: GenericObject): Promise<Response> {
    return this.client.stats(eventName, params);
  }
}
