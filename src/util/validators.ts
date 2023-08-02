import { isValidHashId, isValidDoofinderId, isNumber } from './is';

export class ValidationError extends Error {}

export function validateHashId(value: unknown): string {
  if (value == null) {
    throw new ValidationError(`hashid parameter is mandatory`);
  } else if (!isValidHashId(value)) {
    throw new ValidationError(`invalid hashid`);
  } else {
    return value as string;
  }
}

export function validatePage(value: unknown): number {
  if (typeof value !== 'undefined') {
    const page: number = parseInt(`${value}`, 10);
    if (!isNumber(page) || page <= 0) {
      throw new ValidationError('page must be an integer greater than 0');
    } else {
      return page;
    }
  }
}

export function validateRpp(value: unknown): number {
  if (typeof value !== 'undefined') {
    const rpp: number = parseInt(`${value}`, 10);
    if (!isNumber(rpp) || rpp <= 0 || rpp > 100) {
      throw new ValidationError('rpp must be a number between 1 and 100');
    } else {
      return rpp;
    }
  }
}

export function validateDoofinderId(value: unknown): string {
  if (!isValidDoofinderId(value)) {
    throw new ValidationError('invalid doofinder id');
  } else {
    return value as string;
  }
}

export function validateRequired(values: unknown | unknown[], message: string): unknown | unknown[] {
  const errors = (Array.isArray(values) ? values : [values]).filter(value => {
    return value == null || (typeof value === 'string' && value.trim().length === 0);
  });

  if (errors.length > 0) {
    throw new ValidationError(message);
  }

  return values;
}
