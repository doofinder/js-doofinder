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
