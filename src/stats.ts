import { Client } from './client';
import { GenericObject } from './types';
import { validateRequired, validateDoofinderId, ValidationError } from './util/validators';

export enum StatsEvent {
  Init = 'init',
  Click = 'click',
  Checkout = 'checkout',
  BannerDisplay = 'banner_display',
  BannerClick = 'banner_click',
}

/*
For banner displays:
/5/stats/img_display?hashid=<hashid>&img_id=<img_id>

For banner clicks:
/5/stats/img_click?hashid=<hashid>&img_id=<img_id>

For redirections:
/5/stats/redirect?hashid=<hashid>&redirection_id=<redirection_id>&query=<term>&link=<link>
*/

export interface StatsParams {
  session_id: string;
  hashid: string;
}

export interface ClickStatsParamsWithDfid extends StatsParams {
  dfid: string;
  query?: string;
  custom_results_id?: string | number;
}

export interface ClickStatsParamsWithId extends StatsParams {
  id: string | number;
  datatype: string;
  query?: string;
  custom_results_id?: string | number;
}

export type ClickStatsParams = ClickStatsParamsWithDfid | ClickStatsParamsWithId;

export interface BannerStatsParams extends StatsParams {
  banner_id: string | number;
}

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
   * Registers a new session with Doofinder, and returns
   * the session ID generated for this session
   *
   * @param   {String}     session_id   The session_id
   *
   * @return  {String}     The newly generated Session ID
   */
  public async registerSession(params: StatsParams): Promise<Response> {
    return this.client.stats(StatsEvent.Init, params as GenericObject);
  }

  /**
   * Registers a click within this session, using the dfid
   * or the database id and datatype.
   *
   * @param  {String}   session_id           The session_id
   *
   * @param  {String}   id                  Id of the result or Doofinder's internal ID
   *                                        for the result.
   *
   * @param  {String}   datatype            Optional. If the id is not a Doofinder id
   *                                        this argument is required.
   *
   * @param  {String}   query               Optional. Search terms.
   *
   * @param  {String}   custom_results_id   Optional. Id of the custom results
   *                                        that produced the current set of
   *                                        results, including the current one
   *                                        being clicked.
   *
   */
  public async registerClick(params: ClickStatsParams): Promise<Response> {
    if ('dfid' in params) {
      validateDoofinderId(params.dfid);
      /* eslint-disable @typescript-eslint/ban-ts-ignore */
      // @ts-ignore
      delete params.id;
      // @ts-ignore
      delete params.datatype;
      /* eslint-enable @typescript-eslint/ban-ts-ignore */
    } else {
      validateRequired([params.id, params.datatype], 'dfid or id + datatype are required');
      /* eslint-disable @typescript-eslint/ban-ts-ignore */
      // @ts-ignore
      delete params.dfid;
      /* eslint-enable @typescript-eslint/ban-ts-ignore */
    }
    return this.client.stats(StatsEvent.Click, params as GenericObject);
  }

  /**
   * Register a checkout within the session
   *
   * @param   {String}    session_id   Optional. The session ID
   *
   */
  public async registerCheckout(params: StatsParams): Promise<Response> {
    return this.client.stats(StatsEvent.Checkout, params as GenericObject);
  }

  /**
   *
   * Register the display banner events
   *
   * @param  {Number}    banner_id    The banner ID
   *
   */
  public async registerBannerDisplayEvent(params: BannerStatsParams): Promise<Response> {
    validateRequired(params.banner_id, 'banner_id is required');
    return this.client.stats(StatsEvent.BannerDisplay, params as GenericObject);
  }

  /**
   *
   * Register the display banner events
   *
   * @param  {Number}    banner_id    The banner ID
   *
   */
  public async registerBannerClickEvent(params: BannerStatsParams): Promise<Response> {
    validateRequired(params.banner_id, 'banner_id is required');
    return this.client.stats(StatsEvent.BannerClick, params as GenericObject);
  }

  /**
   *
   * Register any custom event
   *
   * @param  {String}    eventName    The event name to register
   *
   * @param  {Object}    params       The parameters to send alongside.
   *                                  It expects to have a session_id and
   *                                  a hashid
   *
   */
  public async registerEvent(eventName: string, params: GenericObject): Promise<Response> {
    return this.client.stats(eventName as StatsEvent, params);
  }
}
