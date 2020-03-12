export class QueryValueError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = 'QueryValueError';
  }
}
