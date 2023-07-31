import { QueryValueError } from './error';
import { isString } from '../util/is';

/**
 * Class to easily manage Indices filtering in a query.
 *
 * @public
 */
export class QueryIndices {
  private _indices: Set<string> = new Set();

  /**
   * Set the Indices to use to filter a query.
   *
   * @param value - A string or an array of strings representing Indices.
   *
   * @public
   */
  public set(value: string | string[]): void {
    const Indices = Array.isArray(value) ? value : [value];
    if (Indices.filter(isString).length === Indices.length) {
      this._indices = new Set(Indices);
    } else {
      throw new QueryValueError(`Indices must be strings`);
    }
  }

  /**
   * Dump the Indices set as an array of strings.
   * @returns An array of strings.
   * @public
   */
  public dump(): string[] {
    return Array.from(this._indices);
  }

  /**
   * Clear all values used to filter by Index.
   * @public
   */
  public clear(): void {
    this._indices.clear();
  }

  /**
   * Add a value to the set of Indices used to filter.
   *
   * @param value - A Index as string.
   * @public
   */
  public add(value: string): void {
    if (typeof value === 'string') {
      this._indices.add(value);
    } else {
      throw new QueryValueError(`Indices must be strings`);
    }
  }

  /**
   * Check whether the set of Indices selected contain the provided value.
   * @param value - A index name.
   * @returns A boolean value.
   * @public
   */
  public has(value: string): boolean {
    return this._indices.has(value);
  }

  /**
   * Remove a index from the set of Indices selected.
   * @param value - The index name to be removed.
   * @public
   */
  public remove(value: string): void {
    this._indices.delete(value);
  }
}
