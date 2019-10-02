/**
 * This interface allow to use object[key: string] without
 * TypeScript giving problems about it.
 *
 * Beware, as this invalidates some of the type checkings
 * we want from TypeScript, and maybe that is not what you
 * want
 */
export interface GenericObject<T = any> {
    [key: string]: T;
}
export declare type CSSSelector = string;
export declare type CSSUnit = string;
export declare type EventName = string;
