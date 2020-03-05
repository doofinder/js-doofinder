import { isValidHashId } from './is';

export class ValidationError extends Error {}

export function validateHashId(hashid: string): boolean {
  if (hashid == null) {
    throw new ValidationError(`hashid parameter is mandatory`);
  } else if (!isValidHashId(hashid)) {
    throw new ValidationError(`invalid hashid`);
  } else {
    return true;
  }
}

export function validatePage(page: number): boolean {
  if (typeof page !== 'number' || page <= 0) {
    throw new ValidationError('page must be an integer greater than 0');
  } else {
    return true;
  }
}

export function validateRpp(rpp: number): boolean {
  if (typeof rpp !== 'number' || rpp <= 0 || rpp > 100) {
    throw new ValidationError('rpp must be a number between 1 and 100');
  } else {
    return true;
  }
}
