import { Client } from './client';
import { GenericObject, StatsEvent } from './types';
import { isDfid } from './util/is';

interface BaseStatsParams {
  sessionId: string;
  hashid?: string;
}

interface ClickStatsParams extends BaseStatsParams {
  id: string;
  datatype?: string;
  query?: string;
  customResultsId?: string | number;
}

interface BannerStatsParams extends BaseStatsParams {
  bannerId: number;
}

export class StatsClient {
  private client: Client;

  public constructor(client: Client) {
    this.client = client;
  }

  /**
   * Allows changing the current client we
   * are using
   *
   * @param  {Object}   client    The new Doofinder Client to use
   *
   */
  public use(client: Client): void {
    this.client = client;
  }

  /**
   * Registers a new session with Doofinder, and returns
   * the session ID generated for this session
   *
   * @param   {String}     sessionId   The sessionId
   *
   * @return  {String}     The newly generated Session ID
   */
  public async requestSession({ sessionId, hashid }: BaseStatsParams): Promise<GenericObject> {
    if (!sessionId) {
      throw new Error('Session ID must be defined');
    }

    if (hashid) {
      this.client.hashid = hashid;
    }
    return await this.client.stats(StatsEvent.Init, { session_id: sessionId });
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
  public async registerClick({
    sessionId,
    hashid,
    id,
    datatype,
    query,
    customResultsId,
  }: ClickStatsParams): Promise<GenericObject> {
    if (!sessionId) {
      throw new Error('Session ID must be defined');
    }

    const params: GenericObject = {
      session_id: sessionId,
    };

    if (hashid) {
      params['hashid'] = hashid;
    }

    if (isDfid(id)) {
      params['dfid'] = id;
    } else if (datatype) {
      params['id'] = id;
      params['datatype'] = datatype;
    } else {
      throw new Error('Must declare a dfid or an id and datatype');
    }

    if (query) {
      params['query'] = query;
    }

    if (customResultsId) {
      params['custom_results_id'] = customResultsId;
    }

    return await this.client.stats(StatsEvent.Click, params);
  }

  /**
   * Register a checkout within the session
   *
   * @param   {String}    sessionId   Optional. The session ID
   *
   */
  public async registerCheckout({ sessionId, hashid }: BaseStatsParams): Promise<GenericObject> {
    if (!sessionId) {
      throw new Error('Session ID must be defined');
    }

    const params: GenericObject = {
      session_id: sessionId,
    };

    if (hashid) {
      params['hashid'] = hashid;
    }

    return await this.client.stats(StatsEvent.Checkout, params);
  }

  /**
   *
   * Register the display banner events
   *
   * @param  {Number}    bannerId    The banner ID
   *
   */
  public async registerBannerDisplayEvent({ sessionId, bannerId, hashid }: BannerStatsParams): Promise<GenericObject> {
    if (!sessionId) {
      throw new Error('Session ID must be defined');
    }

    const params: GenericObject = {
      session_id: sessionId,
      banner_id: bannerId,
    };

    if (hashid) {
      params['hashid'] = hashid;
    }

    return await this.client.stats(StatsEvent.BannerDisplay, params);
  }

  /**
   *
   * Register the display banner events
   *
   * @param  {Number}    bannerId    The banner ID
   *
   */
  public async registerBannerClickEvent({ sessionId, bannerId, hashid }: BannerStatsParams): Promise<GenericObject> {
    if (!sessionId) {
      throw new Error('Session ID must be defined');
    }

    const params: GenericObject = {
      session_id: sessionId,
      banner_id: bannerId,
    };

    if (hashid) {
      params['hashid'] = hashid;
    }

    return await this.client.stats(StatsEvent.BannerClick, params);
  }
}
