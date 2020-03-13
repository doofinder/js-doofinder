/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Represents an object with an unspecific set of keys and values.
 *
 * @remarks
 *
 * You can enforce the type of all values in the object by passing a
 * type instead of using the default `any`.
 *
 * @public
 */
export interface GenericObject<T = any> {
  [key: string]: T;
}
/* eslint-enable @typescript-eslint/no-explicit-any */
