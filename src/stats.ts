import { Client } from './client';
import { pool } from './pool';
import { GenericObject, StatsEvent, Zone } from './types';
import { validateRequired, validateDoofinderId } from './util/validators';

export interface StatsParams {
  session_id: string;
  hashid: string;
}

export interface ClickStatsParams extends StatsParams {
  dfid?: string;
  id?: string | number;
  datatype?: string;
  query?: string;
  custom_results_id?: string | number;
}

export interface BannerStatsParams extends StatsParams {
  banner_id: string | number;
}

export class StatsClient {
  private _zone: Zone;

  public constructor(zone: Zone) {
    this._zone = zone;
  }

  public get client(): Client {
    return pool.getClient(this._zone);
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
    try {
      validateDoofinderId(params.dfid);
      delete params.id;
      delete params.datatype;
    } catch (e) {
      validateRequired([params.id, params.datatype], 'dfid or id + datatype are required');
      delete params.dfid;
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
