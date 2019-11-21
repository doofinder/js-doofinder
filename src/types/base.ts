/**
 * The zones the client can be from
 */
export enum Zone {
  EU = 'eu1',
  US = 'us1',
}

/**
 * Types for the stats event
 *
 */
export enum StatsEvent {
  Init = 'init',
  Click = 'click',
  Checkout = 'checkout',
  BannerDisplay = 'banner_display',
  BannerClick = 'banner_click',
}

/**
 * This interface allow to use object[key: string] without
 * TypeScript giving problems about it.
 *
 * Beware, as this invalidates some of the type checkings
 * we want from TypeScript, and maybe that is not what you
 * want
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface GenericObject<T = any> {
  [key: string]: T;
}
