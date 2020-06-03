import { QueryValueError } from './error';
import { isString } from '../util/is';

/**
 * Class to easily manage types filtering in a query.
 *
 * @public
 */
export class QueryTypes {
  private _types: Set<string> = new Set();

  /**
   * Set the types to use to filter a query by type.
   *
   * @param value - A string or an array of strings representing types.
   *
   * @public
   */
  public set(value: string | string[]): void {
    const types = Array.isArray(value) ? value : [value];
    if (types.filter(isString).length === types.length) {
      this._types = new Set(types);
    } else {
      throw new QueryValueError(`types must be strings`);
    }
  }

  /**
   * Dump the types set as an array of strings.
   * @returns An array of strings.
   * @public
   */
  public dump(): string[] {
    return Array.from(this._types);
  }

  /**
   * Clear all values used to filter by type.
   * @public
   */
  public clear(): void {
    this._types.clear();
  }

  /**
   * Add a value to the set of types used to filter.
   *
   * @param value - A type as string.
   * @public
   */
  public add(value: string): void {
    if (typeof value === 'string') {
      this._types.add(value);
    } else {
      throw new QueryValueError(`types must be strings`);
    }
  }

  /**
   * Check whether the set of types selected contain the provided value.
   * @param value - A type name.
   * @returns A boolean value.
   * @public
   */
  public has(value: string): boolean {
    return this._types.has(value);
  }

  /**
   * Remove a type from the set of types selected.
   * @param value - The type name to be removed.
   * @public
   */
  public remove(value: string): void {
    this._types.delete(value);
  }
}
