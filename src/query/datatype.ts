import { QueryValueError } from './error';
import { isString } from '../util/is';

export class QueryTypes {
  private _types: Set<string> = new Set();

  public set(value: string | string[]): void {
    const types = Array.isArray(value) ? value : [value];
    if (types.filter(isString).length === types.length) {
      this._types = new Set(types);
    } else {
      throw new QueryValueError(`types must be strings`);
    }
  }

  public dump(): string[] {
    return Array.from(this._types);
  }

  public clear(): void {
    this._types.clear();
  }

  public add(value: string): void {
    if (typeof value === 'string') {
      this._types.add(value);
    } else {
      throw new QueryValueError(`types must be strings`);
    }
  }

  public has(value: string): boolean {
    return this._types.has(value);
  }

  public remove(value: string): void {
    this._types.delete(value);
  }
}
