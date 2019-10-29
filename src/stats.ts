import { Client } from './client';
import { GenericObject, StatsEvent } from './types';
import { isDfid } from './util/is';

export class StatsClient extends Client {
  /**
   * Registers a new session with Doofinder, and returns
   * the session ID generated for this session
   *
   * @param   {String}     sessionId   The sessionId
   *
   * @param   {Function}   callback    Optional, callback after everything works
   *
   * @return  {String}     The newly generated Session ID
   */
  public async requestSession(sessionId: string, hashid?: string): Promise<GenericObject> {
    if (hashid) {
      this.hashid = hashid;
    }
    return await this.stats(StatsEvent.Init, { session_id: sessionId, hashid: this.hashid });
  }

  /**
   * Registers a click within this session, using the dfid
   * or the database id and datatype.
   *
   * @param  {String}   sessionId           The sessionId
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
  public async registerClick(
    sessionId: string,
    id: string,
    datatype?: string,
    query?: string,
    customResultsId?: string | number
  ): Promise<GenericObject> {
    const params: GenericObject = {
      session_id: sessionId,
      hashid: this.hashid,
    };

    if (isDfid(id)) {
      params['dfid'] = id;
    } else if (datatype) {
      params['id'] = id;
      params['datatype'] = datatype;
    } else {
      throw new Error('Must declare a dfid or an id and datatype');
    }

    params['query'] = query || '';

    if (customResultsId) {
      params['custom_results_id'] = customResultsId;
    }

    return await this.stats(StatsEvent.Click, params);
  }

  /**
   * Register a checkout within the session
   *
   * @param   {String}    sessionId   Optional. The session ID
   *
   */
  public async registerCheckout(sessionId: string): Promise<GenericObject> {
    const params = {
      session_id: sessionId,
      hashid: this.hashid,
    };

    return await this.stats(StatsEvent.Checkout, params);
  }

  /**
   *
   * Register the display banner events
   *
   * @param  {Number}    bannerId    The banner ID
   *
   */
  public async registerDisplayBannerEvent(sessionId: string, bannerId: number): Promise<GenericObject> {
    const params = {
      session_id: sessionId,
      hashid: this.hashid,
      banner_id: '' + bannerId,
    };

    return await this.stats(StatsEvent.BannerDisplay, params);
  }

  /**
   *
   * Register the display banner events
   *
   * @param  {Number}    bannerId    The banner ID
   *
   */
  public async registerClickBannerEvent(sessionId: string, bannerId: number): Promise<GenericObject> {
    const params = {
      session_id: sessionId,
      hashid: this.hashid,
      banner_id: '' + bannerId,
    };

    return await this.stats(StatsEvent.BannerClick, params);
  }
}
